import { IPartOrderRepository, PartOrder } from "../../../domain/partOrder";
import { IInventoryPartRepository } from "../../../domain/inventory/repositories/IInventoryPartRepository";
import { PartOrderDto } from "../dtos/PartOrderDto";
import { OrderStatus } from "../../../domain/partOrder/entities/PartOrder";

export class CreatePartOrderUseCase {
    constructor(
        private readonly partOrderRepository: IPartOrderRepository,
        private readonly inventoryPartRepository: IInventoryPartRepository,
    ) { }

    async execute(
        inventoryPartId: string,
        inventoryPartName: string,
        supplier: string,
        quantity: number,
        orderDate: Date,
        expectedDeliveryDate: Date,
        status: OrderStatus,
        totalCost: number,
        orderReference: string
    ): Promise<PartOrderDto | Error> {
        const inventoryPart = await this.inventoryPartRepository.findById(inventoryPartId);

        if (!inventoryPart) {
            return new Error(`La pièce d'inventaire avec l'ID ${inventoryPartId} n'existe pas.`);
        }
        const partOrder = await PartOrder.from(
            undefined,
            inventoryPartId,
            inventoryPartName,
            supplier,
            quantity,
            orderDate,
            expectedDeliveryDate,
            status,
            totalCost,
            orderReference
        );

        if (partOrder instanceof Error) {
            return partOrder;
        }

        await this.partOrderRepository.save(partOrder);

        return partOrder;
    }
}
