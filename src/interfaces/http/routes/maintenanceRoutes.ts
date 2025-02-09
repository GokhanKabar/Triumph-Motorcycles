import express from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { CreateMaintenanceUseCase } from '../../../application/maintenance/use-cases/CreateMaintenanceUseCase';
import { CompleteMaintenanceUseCase } from '../../../application/maintenance/use-cases/CompleteMaintenanceUseCase';
import { FindDueMaintenancesUseCase } from '../../../application/maintenance/use-cases/FindDueMaintenancesUseCase';
import { FindAllMaintenancesUseCase } from '../../../application/maintenance/use-cases/FindAllMaintenancesUseCase';
import { DeleteMaintenanceUseCase } from '../../../application/maintenance/use-cases/DeleteMaintenanceUseCase';
import { UpdateMaintenanceUseCase } from '../../../application/maintenance/use-cases/UpdateMaintenanceUseCase';
import { PostgreSQLMaintenanceRepository } from '../../../infrastructure/repositories/PostgreSQLMaintenanceRepository';
import { PostgreSQLMotorcycleRepository } from '../../../infrastructure/repositories/PostgreSQLMotorcycleRepository';
import { PostgreSQLInventoryPartRepository } from '../../../infrastructure/repositories/PostgreSQLInventoryPartRepository';
import InventoryPart from '../../../domain/inventory/entities/InventoryPart';
import { UserRole } from '../../../domain/enums/UserRole';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { JWTTokenService } from '../../../infrastructure/services/TokenService';
import { GetUserUseCase } from '../../../application/user/use-cases/GetUserUseCase';
import { PostgreSQLUserRepository } from '../../../infrastructure/repositories/PostgreSQLUserRepository';
import { Argon2PasswordHashingService } from '../../../infrastructure/services/Argon2PasswordHashingService';

const router = express.Router();

// Création des instances de repositories et use cases
const maintenanceRepository = new PostgreSQLMaintenanceRepository();
const motorcycleRepository = new PostgreSQLMotorcycleRepository();
const inventoryPartRepository = new PostgreSQLInventoryPartRepository();

const createMaintenanceUseCase = new CreateMaintenanceUseCase(
  maintenanceRepository, 
  motorcycleRepository
);

const completeMaintenanceUseCase = new CompleteMaintenanceUseCase(
  maintenanceRepository, 
  inventoryPartRepository
);

const findDueMaintenancesUseCase = new FindDueMaintenancesUseCase(
  maintenanceRepository
);

const findAllMaintenancesUseCase = new FindAllMaintenancesUseCase(
  maintenanceRepository,
  motorcycleRepository  // Ajout du repository de moto
);

const deleteMaintenanceUseCase = new DeleteMaintenanceUseCase(
  maintenanceRepository
);

const updateMaintenanceUseCase = new UpdateMaintenanceUseCase(
  maintenanceRepository
);

// Création des instances de services et use cases pour le middleware
const passwordHashingService = new Argon2PasswordHashingService();
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const tokenService = new JWTTokenService();
const getUserUseCase = new GetUserUseCase(userRepository);

const authMiddleware = new AuthMiddleware(tokenService, getUserUseCase);

// Création du contrôleur avec injection des dépendances
const maintenanceController = new MaintenanceController(
  createMaintenanceUseCase,
  completeMaintenanceUseCase,
  findDueMaintenancesUseCase,
  findAllMaintenancesUseCase,
  deleteMaintenanceUseCase,
  updateMaintenanceUseCase,
  motorcycleRepository  // Ajout du repository de moto
);

console.log('DEBUG: Routes de maintenance chargées');
console.log('DEBUG: Maintenance Controller:', maintenanceController);

// Routes
router.post('/', 
  authMiddleware.authenticate.bind(authMiddleware), 
  authMiddleware.adminOnly.bind(authMiddleware),   
  (req, res) => maintenanceController.createMaintenance(req, res)
);

router.get('/', 
  authMiddleware.authenticate.bind(authMiddleware), 
  (req, res) => maintenanceController.findDueMaintenances(req, res)
);

router.get('/all', 
  authMiddleware.authenticate.bind(authMiddleware), 
  (req, res) => maintenanceController.getAllMaintenances(req, res)
);

router.patch('/:maintenanceId/complete', 
  authMiddleware.authenticate.bind(authMiddleware),
  (req, res) => maintenanceController.completeMaintenance(req, res)
);

router.get('/due', 
  authMiddleware.authenticate.bind(authMiddleware),
  (req, res) => maintenanceController.findDueMaintenances(req, res)
);

router.delete('/:maintenanceId', 
  authMiddleware.authenticate.bind(authMiddleware), 
  (req, res) => maintenanceController.deleteMaintenance(req, res)
);

// Route de mise à jour de maintenance
router.put(
  '/:id',
  authMiddleware.authenticate.bind(authMiddleware), 
  (req, res) => maintenanceController.updateMaintenance(req, res)
);

export default router;
