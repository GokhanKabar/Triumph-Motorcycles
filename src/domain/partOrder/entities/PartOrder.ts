import { v4 as uuidv4 } from 'uuid';
import { PartOrderValidationError } from '../errors/PartOrderValidationError';
import { IInventoryPartRepository } from '../../inventory/repositories/IInventoryPartRepository';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    DELIVERED = 'DELIVERED',
    IN_PROGRESS = 'IN_PROGRESS',
}

export default class PartOrder {
    constructor(
        public readonly id: string,
        public readonly inventoryPartId: string,
        public readonly inventoryPartName: string,
        public readonly supplier: string,
        public readonly quantity: number,
        public readonly orderDate: Date,
        public readonly expectedDeliveryDate: Date,
        public readonly status: OrderStatus,
        public readonly totalCost: number,
        public readonly orderReference: string,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date
    ) { }

    public static async from(
        id: string | undefined,
        inventoryPartId: string,
        inventoryPartName: string,
        supplier: string,
        quantity: number,
        orderDate: Date,
        expectedDeliveryDate: Date,
        status: OrderStatus,
        totalCost: number,
        orderReference: string,
        createdAt?: Date,
        updatedAt?: Date,
        IInventoryPartRepository?: IInventoryPartRepository
    ): Promise<PartOrder | PartOrderValidationError> {
        const validationErrors: Record<string, string> = {};

        // Générer un ID s'il n'est pas fourni
        const partOrderId = id || uuidv4();

        // Validation des champs
        if (!inventoryPartId) {
            validationErrors['inventoryPartId'] = 'L\'identifiant de la pièce est requis';
        }

        if (!inventoryPartName) {
            validationErrors['inventoryPartName'] = 'Le nom de la pièce est requis';
        }

        if (!supplier) {
            validationErrors['supplier'] = 'Le fournisseur est requis';
        }

        if (quantity <= 0) {
            validationErrors['quantity'] = 'La quantité doit être positive';
        }

        if (!orderDate) {
            validationErrors['orderDate'] = 'La date de commande est requise';
        }

        if (!expectedDeliveryDate) {
            validationErrors['expectedDeliveryDate'] = 'La date de livraison attendue est requise';
        }

        if (!status) {
            validationErrors['status'] = 'Le statut de la commande est requis';
        }

        if (totalCost < 0) {
            validationErrors['totalCost'] = 'Le coût total doit être positif';
        }

        if (!orderReference) {
            validationErrors['orderReference'] = 'La référence de commande est requise';
        }

        if (Object.keys(validationErrors).length > 0) {
            return new PartOrderValidationError(validationErrors);
        }

        return new PartOrder(
            partOrderId,
            inventoryPartId,
            inventoryPartName,
            supplier,
            quantity,
            orderDate,
            expectedDeliveryDate,
            status || OrderStatus.PENDING,
            totalCost,
            orderReference,
            createdAt || new Date(),
            updatedAt || new Date()
        );
    }

    public update(status: OrderStatus): PartOrder {
        return new PartOrder(
            this.id,
            this.inventoryPartId,
            this.inventoryPartName,
            this.supplier,
            this.quantity,
            this.orderDate,
            this.expectedDeliveryDate,
            status,
            this.totalCost,
            this.orderReference,
            this.createdAt,
            new Date()
        );
    }

    public toJSON() {
        return {
            id: this.id,
            inventoryPartId: this.inventoryPartId,
            inventoryPartName: this.inventoryPartName,
            supplier: this.supplier,
            quantity: this.quantity,
            orderDate: this.orderDate,
            expectedDeliveryDate: this.expectedDeliveryDate,
            status: this.status,
            totalCost: this.totalCost,
            orderReference: this.orderReference,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
