import { Request, Response } from 'express';
import { IValidationService } from '../../../application/services/IValidationService';
import { ITokenService } from '../../../application/services/ITokenService';
import { IPasswordHashingService } from '../../../application/services/IPasswordHashingService';
import { CreateUserUseCase } from '../../../application/user/use-cases/CreateUserUseCase';
import { GetUserUseCase } from '../../../application/user/use-cases/GetUserUseCase';
import { UpdateUserUseCase } from '../../../application/user/use-cases/UpdateUserUseCase';
import { LoginUseCase } from '../../../application/user/use-cases/LoginUseCase';
import { CreateUserValidationResult, LoginValidationResult } from '../../../domain/types/validation.types';
import { UserRole } from '../../../domain/enums/UserRole';
import { ValidationError } from '../../../infrastructure/services/ValidationService';
import { TokenPayload } from '../../../infrastructure/services/TokenService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Constantes pour les durées d'expiration en secondes
const ONE_HOUR = 60 * 60;          // 1 heure
const ONE_DAY = 24 * ONE_HOUR;     // 24 heures

export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly tokenService: ITokenService,
    private readonly passwordHashingService: IPasswordHashingService,
    private readonly validationService: IValidationService
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('Données reçues:', req.body);
      const validatedData = await this.validationService.validate<LoginValidationResult>(req.body, 'login');
      
      const result = await this.loginUseCase.execute({
        email: validatedData.email.value,
        password: validatedData.password.value
      });

      if (result instanceof Error) {
        res.status(401).json({ message: result.message });
        return;
      }

      const tokenPayload: TokenPayload = {
        id: result.id,
        email: result.email,
        role: result.role
      };

      // Générer le token d'accès (1 heure)
      const token = await this.tokenService.generateToken(tokenPayload, ONE_HOUR);
      
      // Générer le refresh token (7 jours)
      const refreshToken = await this.tokenService.generateRefreshToken(tokenPayload);

      // Envoyer les deux tokens
      res.json({
        user: {
          id: result.id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          role: result.role
        },
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = await this.validationService.validate<CreateUserValidationResult>(req.body, 'createUser');
      
      const result = await this.createUserUseCase.execute(
        validatedData.firstName.value,
        validatedData.lastName.value,
        validatedData.email.value,
        validatedData.password.value,
        validatedData.role || UserRole.USER
      );

      if (result instanceof Error) {
        res.status(400).json({ message: result.message });
        return;
      }

      const tokenPayload: TokenPayload = {
        id: result.id,
        email: result.email,
        role: result.role
      };

      const token = await this.tokenService.generateToken(tokenPayload, ONE_HOUR);

      res.status(201).json({
        user: {
          id: result.id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          role: result.role
        },
        token
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const userResult = await this.getUserUseCase.getByEmail(req.user.email);
      if (userResult instanceof Error) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }

      res.json({
        id: userResult.id,
        firstName: userResult.firstName,
        lastName: userResult.lastName,
        email: userResult.email,
        role: userResult.role
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };

  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token manquant' });
        return;
      }

      // Vérifier le refresh token
      const decoded = await this.tokenService.verifyRefreshToken(refreshToken);

      // Générer un nouveau token d'accès
      const tokenPayload: TokenPayload = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      const newToken = await this.tokenService.generateToken(tokenPayload, ONE_HOUR);

      res.json({
        token: newToken
      });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      res.status(401).json({ message: 'Refresh token invalide ou expiré' });
    }
  };

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error) {
      res.status(500).json({ message: 'Une erreur est survenue lors de la déconnexion' });
    }
  }

  async createAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = await this.validationService.validate<CreateUserValidationResult>(req.body, 'createUser');
      
      const result = await this.createUserUseCase.execute(
        validatedData.firstName.value,
        validatedData.lastName.value,
        validatedData.email.value,
        validatedData.password.value,
        UserRole.ADMIN
      );

      if (result instanceof Error) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.status(201).json({
        message: 'Admin user created successfully',
        user: {
          id: result.id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          role: result.role
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création d\'un utilisateur admin:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}
