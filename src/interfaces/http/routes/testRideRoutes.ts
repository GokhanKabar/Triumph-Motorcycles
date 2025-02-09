import { Router } from 'express';
import { TestRideController } from '../controllers/TestRideController';
import { 
  CreateTestRideUseCase, 
  GetTestRideUseCase,
  GetAllTestRidesUseCase,
  DeleteTestRideUseCase,
  UpdateTestRideStatusUseCase
} from '../../../application/testRide';
import { TestRideRepositoryImpl } from '../../../infrastructure/repositories/TestRideRepositoryImpl';

export function testRideRoutes(
  testRideRepository: TestRideRepositoryImpl
): Router {
  const router = Router();
  const createTestRideUseCase = new CreateTestRideUseCase(testRideRepository);
  const getTestRideUseCase = new GetTestRideUseCase(testRideRepository);
  const getAllTestRidesUseCase = new GetAllTestRidesUseCase(testRideRepository);
  const deleteTestRideUseCase = new DeleteTestRideUseCase(testRideRepository);
  const updateTestRideStatusUseCase = new UpdateTestRideStatusUseCase(testRideRepository);
  
  const testRideController = new TestRideController(
    createTestRideUseCase,
    getTestRideUseCase,
    getAllTestRidesUseCase,
    deleteTestRideUseCase,
    updateTestRideStatusUseCase
  );

  router.post('/', (req, res) => testRideController.create(req, res));
  router.get('/', (req, res) => testRideController.getAll(req, res));
  router.get('/:id', (req, res) => testRideController.getById(req, res));
  router.get('/concession/:concessionId', (req, res) => testRideController.getByConcessionId(req, res));
  router.get('/:id/details', (req, res) => testRideController.getDetails(req, res));
  router.delete('/:id', (req, res) => testRideController.delete(req, res));
  router.patch('/:id/status', (req, res) => testRideController.updateStatus(req, res));

  return router;
}
