import { PartCategory } from '@domain/inventory/entities/InventoryPart';

export interface CreateInventoryPartDTO {
  name: string;
  category: PartCategory;
  referenceNumber: string;
  currentStock: number;
  minStockThreshold: number;
  unitPrice: number;
  motorcycleModels: string[];
}
