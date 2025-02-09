import { OrderStatus } from '../../../domain/partOrder/entities/PartOrder';

export interface PartOrderDto {
    id: string;
    inventoryPartId: string;
    inventoryPartName: string;
    supplier: string;
    quantity: number;
    orderDate: Date;
    expectedDeliveryDate: Date;
    status: OrderStatus;
    totalCost: number;
    orderReference: string
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreatePartOrderDto {
    inventoryPartId: string;
    inventoryPartName: string;
    supplier: string;
    quantity: number;
    orderDate: Date;
    expectedDeliveryDate: Date;
    status?: OrderStatus;
    totalCost: number;
    orderReference: string;
}

export interface UpdatePartOrderStatusDto {
    id: string;
    status: OrderStatus;
}