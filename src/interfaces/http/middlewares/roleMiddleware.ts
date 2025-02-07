import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../domain/enums/UserRole';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('DEBUG: Middleware de rôle');
    console.log('Utilisateur connecté:', req.user);
    console.log('Rôles autorisés:', allowedRoles);

    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      console.log('DEBUG: Utilisateur non authentifié');
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier si le rôle de l'utilisateur est autorisé
    if (!allowedRoles.includes(req.user.role)) {
      console.log('DEBUG: Rôle non autorisé', {
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
      return res.status(403).json({ 
        message: 'Accès refusé. Autorisation insuffisante.',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    console.log('DEBUG: Accès autorisé');
    next();
  };
};

// Exemples de middlewares préconfigurés
export const adminOnly = requireRole([UserRole.ADMIN]);