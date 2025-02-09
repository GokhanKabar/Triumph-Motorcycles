import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../../../application/services/ITokenService';
import { UserRole } from '../../../domain/enums/UserRole';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        permissions?: string[];
      };
    }
  }
}

export class AuthMiddleware {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly getUserUseCase: { count: () => Promise<number>; getById: (id: string) => Promise<any> }
  ) { }

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Routes publiques sans authentification
      const publicRoutes = [
        { path: '/api/users/users', method: 'POST' },
        { path: '/api/users', method: 'POST' },
        { path: '/api/users/all', method: 'GET' },
        { path: '/api/concessions', method: '*' },
        { path: '/api/motorcycles', method: '*' },
        { path: '/api/test-rides', method: '*' },
        { path: '/api/part-orders', method: '*' },
      ];

      // Vérifier si la route est publique
      const isPublicRoute = publicRoutes.some(
        route =>
          req.path.startsWith(route.path) &&
          (route.method === req.method || route.method === '*')
      );

      // Si c'est une route publique, autoriser sans vérification de token
      if (isPublicRoute) {
        return next();
      }

      // Pour les autres routes, vérifier le token
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const tokenParts = authHeader.split(' ');

      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const token = tokenParts[1];

      if (!token) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      // Vérifier et décoder le token
      let payload;
      try {
        payload = await this.tokenService.verifyToken(token);
      } catch (verifyError) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      let userResult;
      try {
        userResult = await this.getUserUseCase.getById(payload.id);
        if (userResult instanceof Error) {
          res.status(401).json({ message: 'Non authentifié' });
          return;
        }
      } catch (userError) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }
      // Ajouter les informations de l'utilisateur à la requête
      (req as any).user = {
        id: userResult.id,
        email: userResult.email,
        role: userResult.role
      };
      next();
    } catch (error) {
      res.status(401).json({ message: 'Non authentifié' });
    }
  };

  requireRole = (roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Non authentifié' });
          return;
        }

        if (!roles.includes(req.user.role)) {
          res.status(403).json({ message: 'Accès non autorisé' });
          return;
        }

        next();
      } catch (error) {
        if (error instanceof Error) {
          res.status(403).json({ message: error.message });
        } else {
          res.status(403).json({ message: 'Erreur lors de la vérification des droits' });
        }
      }
    };
  };

  checkRole = (allowedRoles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const userRole = req.user.role;
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ message: 'Accès non autorisé' });
        return;
      }

      next();
    };
  };

  checkUserRole = (allowedRoles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
          return res.status(401).json({ message: 'Aucun token fourni' });
        }

        const decoded = await this.tokenService.verifyToken(token);
        const userRole = decoded.role as UserRole;

        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({
            message: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
          });
        }

        // Attach user info to request for further use if needed
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré' });
      }
    };
  }

  // Helper pour les routes admin uniquement
  adminOnly = this.requireRole([UserRole.ADMIN]);
}
