import { Router } from 'express';
import { IncidentController } from '../controllers/IncidentController';
import { 
  CreateIncidentUseCase 
} from '../../../application/incident/use-case/CreateIncidentUseCase';
import { 
  GetIncidentsUseCase 
} from '../../../application/incident/use-case/GetIncidentsUseCase';
import { 
  UpdateIncidentUseCase 
} from '../../../application/incident/use-case/UpdateIncidentUseCase';
import { 
  DeleteIncidentUseCase 
} from '../../../application/incident/use-case/DeleteIncidentUseCase';
import { IncidentRepositoryImpl } from '../../../infrastructure/repositories/IncidentRepositoryImpl';
import { TestRideRepositoryImpl } from '../../../infrastructure/repositories/TestRideRepositoryImpl';

export function incidentRoutes(
  incidentRepository: IncidentRepositoryImpl,
  testRideRepository: TestRideRepositoryImpl
): Router {
  const router = Router();
  
  const createIncidentUseCase = new CreateIncidentUseCase(
    incidentRepository, 
    testRideRepository
  );
  const getIncidentsUseCase = new GetIncidentsUseCase(incidentRepository);
  const updateIncidentUseCase = new UpdateIncidentUseCase(incidentRepository);
  const deleteIncidentUseCase = new DeleteIncidentUseCase(incidentRepository);
  
  const incidentController = new IncidentController(
    createIncidentUseCase,
    getIncidentsUseCase,
    updateIncidentUseCase,
    deleteIncidentUseCase
  );

  // Routes pour les incidents
  router.post('/', (req, res) => incidentController.createIncident(req, res));
  // Route pour récupérer tous les incidents
  router.get('/', (req, res) => incidentController.getAllIncidents(req, res));
  router.get('/test-ride/:testRideId', (req, res) => incidentController.getIncidentsByTestRideId(req, res));
  router.get('/type/:type', (req, res) => incidentController.getIncidentsByType(req, res));
  router.get('/status/:status', (req, res) => incidentController.getIncidentsByStatus(req, res));
  
  // Nouvelles routes pour update et delete
  router.put('/:id', (req, res) => incidentController.updateIncident(req, res));
  router.delete('/:id', (req, res) => incidentController.deleteIncident(req, res));

  return router;
}
