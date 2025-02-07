import InventoryPart, { PartCategory } from '../entities/InventoryPart';
import { InventoryPartNotFoundError } from '../errors/InventoryPartNotFoundError';

export interface IInventoryPartRepository {
  findById(id: string): Promise<InventoryPart | InventoryPartNotFoundError>;
  findByCategory(category: PartCategory): Promise<InventoryPart[]>;
  findByMotorcycleModel(model: string): Promise<InventoryPart[]>;
  findLowStockParts(): Promise<InventoryPart[]>;
  save(part: InventoryPart): Promise<void>;
  update(part: InventoryPart): Promise<void>;
  delete(id: string): Promise<void>;
  decreaseStock(id: string, quantity: number): Promise<void>;
  increaseStock(id: string, quantity: number): Promise<void>;
}
