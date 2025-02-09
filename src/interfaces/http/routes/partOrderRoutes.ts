import { Router } from 'express';
import { PartOrderController } from '../controllers/PartOrderController';
import {
    CreatePartOrderUseCase,
    GetPartOrderUseCase,
    GetAllPartOrdersUseCase,
    DeletePartOrderUseCase,
    UpdatePartOrderStatusUseCase
} from '../../../application/partOrder';
import { PartOrderRepositoryImpl } from '../../../infrastructure/repositories/PartOrderRepositoryImpl';
export function partOrderRoutes(
    partOrderRepository: PartOrderRepositoryImpl
): Router {
    const router = Router();
    const createPartOrderUseCase = new CreatePartOrderUseCase(partOrderRepository);
    const getPartOrderUseCase = new GetPartOrderUseCase(partOrderRepository);
    const getAllPartOrdersUseCase = new GetAllPartOrdersUseCase(partOrderRepository);
    const deletePartOrderUseCase = new DeletePartOrderUseCase(partOrderRepository);
    const updatePartOrderStatusUseCase = new UpdatePartOrderStatusUseCase(partOrderRepository);

    const partOrderController = new PartOrderController(
        createPartOrderUseCase,
        getPartOrderUseCase,
        getAllPartOrdersUseCase,
        deletePartOrderUseCase,
        updatePartOrderStatusUseCase
    );
    router.post('/', (req, res) => partOrderController.create(req, res));
    router.get('/', (req, res) => partOrderController.getAll(req, res));
    router.get('/:id', (req, res) => partOrderController.getById(req, res));
    router.get('/concession/:concessionId', (req, res) => partOrderController.getByConcessionId(req, res));
    router.get('/inventory-part/:inventoryPartId', (req, res) => partOrderController.getByInventoryPartId(req, res));
    router.delete('/:id', (req, res) => partOrderController.delete(req, res));
    router.patch('/:id/status', (req, res) => partOrderController.updateStatus(req, res));
    return router;
}