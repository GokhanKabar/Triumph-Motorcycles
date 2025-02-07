import express from 'express';
import { DriverController } from '../controllers/DriverController';
import { CreateDriverUseCase } from '../../../application/driver/use-cases/CreateDriverUseCase';
import { AssignDriverMotorcycleUseCase } from '../../../application/driver/use-cases/AssignDriverMotorcycleUseCase';
import { RecordDriverIncidentUseCase } from '../../../application/driver/use-cases/RecordDriverIncidentUseCase';
import { PostgreSQLDriverRepository } from '../../../infrastructure/repositories/PostgreSQLDriverRepository';

const router = express.Router();

// Création des instances de repositories et use cases
const driverRepository = new PostgreSQLDriverRepository();
const createDriverUseCase = new CreateDriverUseCase(driverRepository);
const assignDriverMotorcycleUseCase = new AssignDriverMotorcycleUseCase(driverRepository);
const recordDriverIncidentUseCase = new RecordDriverIncidentUseCase(driverRepository);

// Création du contrôleur avec injection des dépendances
const driverController = new DriverController(
  createDriverUseCase,
  assignDriverMotorcycleUseCase,
  recordDriverIncidentUseCase,
  driverRepository
);

// Routes
router.post('/', 
  driverController.createDriver.bind(driverController)
);

router.get('/', 
  driverController.getAllDrivers.bind(driverController)
);

router.put('/:id', 
  driverController.updateDriver.bind(driverController)
);

router.delete('/:id', 
  driverController.deleteDriver.bind(driverController)
);

router.patch('/assign-motorcycle', 
  driverController.assignMotorcycle.bind(driverController)
);

router.patch('/record-incident', 
  driverController.recordIncident.bind(driverController)
);

router.patch('/:id/status', 
  driverController.changeDriverStatus.bind(driverController)
);

export default router;
