import { v4 as uuidv4 } from 'uuid';

export enum PartCategory {
  OIL_FILTER = 'OIL_FILTER',
  BRAKE_PAD = 'BRAKE_PAD',
  BRAKE_SYSTEM = 'BRAKE_SYSTEM',
  TIRE = 'TIRE',
  CHAIN = 'CHAIN',
  SPARK_PLUG = 'SPARK_PLUG',
  OTHER = 'OTHER'
}

export default class InventoryPart {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly category: PartCategory,
    public readonly referenceNumber: string,
    public readonly currentStock: number,
    public readonly minStockThreshold: number,
    public readonly unitPrice: number,
    public readonly motorcycleModels: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static from(
    name: string,
    category: PartCategory,
    referenceNumber: string,
    currentStock: number,
    minStockThreshold: number,
    unitPrice: number,
    motorcycleModels: string[],
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ): InventoryPart | Error {
    if (!name || !referenceNumber) {
      return new Error('Name and reference number are required');
    }

    return new InventoryPart(
      id || uuidv4(),
      name,
      category,
      referenceNumber,
      currentStock,
      minStockThreshold,
      unitPrice,
      motorcycleModels,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public updateStock(quantity: number): InventoryPart {
    return new InventoryPart(
      this.id,
      this.name,
      this.category,
      this.referenceNumber,
      this.currentStock + quantity,
      this.minStockThreshold,
      this.unitPrice,
      this.motorcycleModels,
      this.createdAt,
      new Date()
    );
  }

  public isLowStock(): boolean {
    return this.currentStock <= this.minStockThreshold;
  }
}
