import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { InventoryPartController } from '../controllers/InventoryPartController';
import { CreateInventoryPartUseCase } from '@application/inventory/use-cases/CreateInventoryPartUseCase';
import { ManageInventoryStockUseCase } from '@application/inventory/use-cases/ManageInventoryStockUseCase';
import { PostgreSQLInventoryPartRepository } from '@infrastructure/repositories/PostgreSQLInventoryPartRepository';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { JWTTokenService } from '@infrastructure/services/TokenService';
import { GetUserUseCase } from '@application/user/use-cases/GetUserUseCase';
import { ValidationService } from '@infrastructure/services/ValidationService';
import { PostgreSQLUserRepository } from '@infrastructure/repositories/PostgreSQLUserRepository';
import { Argon2PasswordHashingService } from '@infrastructure/services/Argon2PasswordHashingService';
import { UserRole } from '@domain/enums/UserRole';

const router = express.Router();

// Création des instances
const inventoryPartRepository = new PostgreSQLInventoryPartRepository();
const createInventoryPartUseCase = new CreateInventoryPartUseCase(inventoryPartRepository);
const manageInventoryStockUseCase = new ManageInventoryStockUseCase(inventoryPartRepository);
const validationService = new ValidationService();
const tokenService = new JWTTokenService();

// Récupération du use case de l'utilisateur pour l'authentification
const getUserUseCase = new GetUserUseCase(
  new PostgreSQLUserRepository(
    new Argon2PasswordHashingService()
  )
);

// Middleware d'authentification
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCase);

// Création du contrôleur avec injection des dépendances
const inventoryPartController = new InventoryPartController(
  createInventoryPartUseCase,
  manageInventoryStockUseCase,
  inventoryPartRepository,
  validationService
);

// Middleware d'authentification global pour toutes les routes
router.use(authMiddleware.authenticate.bind(authMiddleware));

// Middleware de journalisation et de vérification du rôle admin
router.use((req: Request, res: Response, next: NextFunction) => {
  // Vérification explicite de l'utilisateur et de son rôle
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentification requise.'
    });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les administrateurs peuvent accéder à ces ressources.',
      requiredRole: UserRole.ADMIN
    });
  }
  next();
});

// Route pour récupérer toutes les pièces d'inventaire (réservé aux administrateurs)
router.get('/', 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      return inventoryPartController.getAll(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Route pour récupérer toutes les pièces d'inventaire (réservé aux administrateurs)
router.get('/all', 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      return inventoryPartController.getAll(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Route pour récupérer une pièce d'inventaire par son ID (réservé aux administrateurs)
router.get('/:id', 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      return inventoryPartController.getById(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Route pour créer une nouvelle pièce d'inventaire (réservé aux administrateurs)
router.post('/', 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      return inventoryPartController.create(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Route pour mettre à jour une pièce d'inventaire (réservé aux administrateurs)
router.put('/:id', 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      return inventoryPartController.update(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Route pour supprimer une pièce d'inventaire (réservé aux administrateurs)
router.delete('/:id', 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      return inventoryPartController.delete(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Route pour gérer le stock d'une pièce d'inventaire (réservé aux administrateurs)
router.patch('/:id/stock', 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      return inventoryPartController.manageStock(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Gestionnaire d'erreurs global pour les routes d'inventaire
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Réponse d'erreur par défaut
  res.status(err?.status || 500).json({
    message: 'Une erreur est survenue lors du traitement de la requête.',
    error: process.env.NODE_ENV === 'development' ? (err?.message || 'Erreur interne') : 'Erreur interne'
  });
};

router.use(errorHandler);

export default router;
