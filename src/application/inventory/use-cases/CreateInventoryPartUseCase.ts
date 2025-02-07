import { IInventoryPartRepository } from '../../../domain/inventory/repositories/IInventoryPartRepository';
import InventoryPart from '../../../domain/inventory/entities/InventoryPart';
import { CreateInventoryPartDTO } from '../dtos/CreateInventoryPartDTO';
import { InventoryPartResponseDTO } from '../dtos/InventoryPartResponseDTO';
import { InventoryPartValidationError } from '../../../domain/inventory/errors/InventoryPartValidationError';

export class CreateInventoryPartUseCase {
  constructor(
    private inventoryPartRepository: IInventoryPartRepository
  ) {}

  async execute(
    createInventoryPartDTO: CreateInventoryPartDTO
  ): Promise<InventoryPartResponseDTO | InventoryPartValidationError> {
    // Créer la pièce d'inventaire
    const inventoryPartResult = InventoryPart.from(
      createInventoryPartDTO.name,
      createInventoryPartDTO.category,
      createInventoryPartDTO.referenceNumber,
      createInventoryPartDTO.currentStock,
      createInventoryPartDTO.minStockThreshold,
      createInventoryPartDTO.unitPrice,
      createInventoryPartDTO.motorcycleModels
    );

    if (inventoryPartResult instanceof InventoryPartValidationError) {
      return inventoryPartResult;
    }

    // Sauvegarder la pièce d'inventaire
    await this.inventoryPartRepository.save(inventoryPartResult);

    // Convertir en DTO de réponse
    return {
      id: inventoryPartResult.id,
      name: inventoryPartResult.name,
      category: inventoryPartResult.category,
      referenceNumber: inventoryPartResult.referenceNumber,
      currentStock: inventoryPartResult.currentStock,
      minStockThreshold: inventoryPartResult.minStockThreshold,
      unitPrice: inventoryPartResult.unitPrice,
      motorcycleModels: inventoryPartResult.motorcycleModels,
      createdAt: inventoryPartResult.createdAt,
      updatedAt: inventoryPartResult.updatedAt
    };
  }
}
