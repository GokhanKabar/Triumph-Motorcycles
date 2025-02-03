import { Request, Response } from 'express';
import { 
  CreateUserUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
  GetAllUsersUseCase,
  DeleteUserUseCase,
  UpdateUserPasswordUseCase
} from '../../../application/user';
import { UserRole } from '../../../domain/enums/UserRole';
import { IValidationService } from '../../../application/services/IValidationService';
import { UserAlreadyExistsError, UserNotFoundError } from '../../../application/errors/ApplicationError';
import { ValidationError } from '../../../infrastructure/services/ValidationService';
import { CreateUserValidationResult, UpdateUserValidationResult } from '../../../domain/types/validation.types';
import { UpdateUserPasswordDTO } from '../../../application/user/dtos/UserDTO';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly validationService: IValidationService,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly updateUserPasswordUseCase: UpdateUserPasswordUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = await this.validationService.validate<CreateUserValidationResult>(
        req.body,
        'createUser'
      );

      const user = await this.createUserUseCase.execute(
        validatedData.firstName.value,
        validatedData.lastName.value,
        validatedData.email.value,
        validatedData.password.value,
        validatedData.role
      );
      
      res.status(201).json(user);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          message: 'Données invalides',
          errors: error.errors
        });
        return;
      }
      
      if (error instanceof UserAlreadyExistsError) {
        res.status(409).json({ message: error.message });
        return;
      }

      console.error('Erreur lors de la création de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Vérifier que seul un ADMIN peut lister tous les utilisateurs
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ 
          message: 'Accès refusé. Seul un administrateur peut lister les utilisateurs.' 
        });
        return;
      }

      const users = await this.getAllUsersUseCase.execute();
      res.json(users);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.getUserUseCase.getById(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      res.json(user);
    } catch (error: unknown) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = await this.validationService.validate<UpdateUserValidationResult>(
        req.body,
        'updateUser'
      );

      const updateData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        role: UserRole;
      }> = {
        ...(validatedData.firstName && { firstName: validatedData.firstName.value }),
        ...(validatedData.lastName && { lastName: validatedData.lastName.value }),
        ...(validatedData.email && { email: validatedData.email.value }),
        ...(validatedData.role && { role: validatedData.role })
      };

      const user = await this.updateUserUseCase.execute(req.params.id, updateData);
      res.json(user);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          message: 'Données invalides',
          errors: error.errors
        });
        return;
      }

      if (error instanceof UserNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }

      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      console.log('Tentative de suppression de l\'utilisateur avec ID:', id);

      // Empêcher la suppression de son propre compte
      if (id === req.user?.id) {
        res.status(403).json({ 
          message: 'Vous ne pouvez pas supprimer votre propre compte.' 
        });
        return;
      }

      // Vérifier que seul un ADMIN peut supprimer des utilisateurs
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ 
          message: 'Accès refusé. Seul un administrateur peut supprimer des utilisateurs.' 
        });
        return;
      }

      try {
        // Supprimer l'utilisateur
        const wasDeleted = await this.deleteUserUseCase.execute(id);
        
        if (wasDeleted) {
          console.log(`Utilisateur ${id} supprimé avec succès`);
          res.status(200).json({ 
            message: 'Utilisateur supprimé avec succès',
            userId: id,
            details: `L'utilisateur avec l'ID ${id} a été supprimé avec succès.`
          });
        } else {
          console.log(`Aucun utilisateur trouvé avec l'ID ${id}`);
          res.status(200).json({ 
            message: 'Aucun utilisateur trouvé, considéré comme déjà supprimé',
            userId: id,
            details: `Aucun utilisateur trouvé avec l'ID ${id}. Il est possible que l'utilisateur ait déjà été supprimé.`
          });
        }
      } catch (deleteError) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', deleteError);
        this.handleError(res, deleteError);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      this.handleError(res, error);
    }
  }

  async createAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = await this.validationService.validate<CreateUserValidationResult>(
        req.body,
        'createUser'
      );

      const user = await this.createUserUseCase.execute(
        validatedData.firstName.value,
        validatedData.lastName.value,
        validatedData.email.value,
        validatedData.password.value,
        validatedData.role
      );

      res.status(201).json(user);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          message: 'Données invalides',
          errors: error.errors
        });
        return;
      }
      
      if (error instanceof UserAlreadyExistsError) {
        res.status(409).json({ message: error.message });
        return;
      }

      console.error('Erreur lors de la création de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async resetUserPasswordByAdmin(req: Request, res: Response): Promise<void> {
    try {
      console.log('UserController - Réinitialisation du mot de passe par admin');
      console.log('Paramètres de la requête:', {
        userId: req.params.userId,
        passwordProvided: !!req.body.password
      });

      const userId = req.params.userId;
      
      const updateData: UpdateUserPasswordDTO = {
        password: req.body.password,
        isAdminUpdate: true
      };

      console.log('Données de mise à jour:', updateData);

      const result = await this.updateUserPasswordUseCase.execute({ userId, updatePasswordData: updateData });
      
      console.log('Résultat de la mise à jour:', result);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe par admin:', error);
      this.handleError(res, error);
    }
  }

  async updateUserPassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; // Récupérer l'ID de l'utilisateur connecté
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const updateData: UpdateUserPasswordDTO = {
        currentPassword: req.body.currentPassword,
        password: req.body.password,
        isAdminUpdate: false
      };

      const result = await this.updateUserPasswordUseCase.execute({ userId, updatePasswordData: updateData });
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown): void {
    console.error('Erreur détaillée:', error);
    
    if (error instanceof Error) {
      // Specific error handling for known error types
      if (error.name === 'ValidationError') {
        res.status(400).json({ message: error.message });
        return;
      }
    }

    // Send a more informative error response
    res.status(500).json({ 
      message: 'Erreur interne du serveur', 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
