import { IPartOrderRepository } from "../../../domain/partOrder/repositories/IPartOrderRepository";
import { PartOrderDto } from "../dtos/PartOrderDto";
import PartOrderNotFoundError from "../../../domain/partOrder/errors/PartOrderNotFoundError";

export class GetPartOrderUseCase {
    constructor(private readonly partOrderRepository: IPartOrderRepository) { }

    async execute(id: string): Promise<PartOrderDto | Error> {
        const partOrder = await this.partOrderRepository.findById(id);

        if (!partOrder) {
            return new PartOrderNotFoundError(id);
        }

        return {
            id: partOrder.id,
            inventoryPartId: partOrder.inventoryPartId,
            inventoryPartName: partOrder.inventoryPartName,
            supplier: partOrder.supplier,
            quantity: partOrder.quantity,
            orderDate: partOrder.orderDate,
            expectedDeliveryDate: partOrder.expectedDeliveryDate,
            status: partOrder.status,
            totalCost: partOrder.totalCost,
            orderReference: partOrder.orderReference,
            createdAt: partOrder.createdAt,
            updatedAt: partOrder.updatedAt
        };
    }
}
