import { IPartOrderRepository } from "../../../domain/partOrder/repositories/IPartOrderRepository";
import { OrderStatus } from '../../../domain/partOrder/entities/PartOrder';
import { PartOrderDto } from "../dtos/PartOrderDto";

export class GetAllPartOrdersUseCase {
    constructor(private readonly partOrderRepository: IPartOrderRepository) { }

    async execute(): Promise<PartOrderDto[]> {
        const partOrders = await this.partOrderRepository.findAll();
        return partOrders.map(partOrder => {
            return {
                id: partOrder.id,
                inventoryPartId: partOrder.inventoryPartId,
                inventoryPartName: partOrder.inventoryPartName,
                supplier: partOrder.supplier,
                quantity: partOrder.quantity,
                orderDate: partOrder.orderDate,
                expectedDeliveryDate: partOrder.expectedDeliveryDate,
                status: partOrder.status || OrderStatus.PENDING,
                totalCost: partOrder.totalCost,
                orderReference: partOrder.orderReference,
                createdAt: partOrder.createdAt,
                updatedAt: partOrder.updatedAt
            };
        });
    }
}