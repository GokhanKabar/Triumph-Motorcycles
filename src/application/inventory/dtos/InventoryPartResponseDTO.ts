import { PartCategory } from '@domain/inventory/entities/InventoryPart';

export interface InventoryPartResponseDTO {
  id: string;
  name: string;
  category: PartCategory;
  referenceNumber: string;
  currentStock: number;
  minStockThreshold: number;
  unitPrice: number;
  motorcycleModels: string[];
  createdAt: Date;
  updatedAt: Date;
}
