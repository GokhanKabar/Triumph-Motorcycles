import { IPartOrderRepository } from "../../../domain/partOrder/repositories/IPartOrderRepository";
import { PartOrder } from "../../../domain/partOrder";
import PartOrderNotFoundError from "../../../domain/partOrder/errors/PartOrderNotFoundError";
import { OrderStatus } from "../../../domain/partOrder/entities/PartOrder";

export class UpdatePartOrderUseCase {
    constructor(private readonly partOrderRepository: IPartOrderRepository) { }

    async execute(
        id: string,
        inventoryPartId: string,
        inventoryPartName: string,
        supplier: string,
        quantity: number,
        orderDate: Date,
        expectedDeliveryDate: Date,
        status: OrderStatus,
        totalCost: number,
        orderReference: string
    ): Promise<PartOrder | Error> {
        const existingPartOrder = await this.partOrderRepository.findById(id);

        if (!existingPartOrder) {
            return new PartOrderNotFoundError(id);
        }

        const updatedPartOrder = await PartOrder.from(
            id,
            inventoryPartId,
            inventoryPartName,
            supplier,
            quantity,
            orderDate,
            expectedDeliveryDate,
            status,
            totalCost,
            orderReference,
            existingPartOrder.createdAt,
            new Date()
        );

        if (updatedPartOrder instanceof Error) {
            return updatedPartOrder;
        }

        await this.partOrderRepository.update(updatedPartOrder);
        return updatedPartOrder;
    }
}
