import { IInventoryPartRepository } from '../../../domain/inventory/repositories/IInventoryPartRepository';
import { InventoryPartResponseDTO } from '../dtos/InventoryPartResponseDTO';
import { InventoryPartNotFoundError } from '../../../domain/inventory/errors/InventoryPartNotFoundError';

export interface UpdateStockDTO {
  partId: string;
  quantityChange: number;
  reason?: string;
}

export class ManageInventoryStockUseCase {
  constructor(
    private inventoryPartRepository: IInventoryPartRepository
  ) {}

  async execute(
    updateStockDTO: UpdateStockDTO
  ): Promise<InventoryPartResponseDTO | InventoryPartNotFoundError> {
    // Rechercher la pièce d'inventaire
    const inventoryPartResult = await this.inventoryPartRepository.findById(updateStockDTO.partId);
    
    if (inventoryPartResult instanceof InventoryPartNotFoundError) {
      return inventoryPartResult;
    }

    // Mettre à jour le stock
    const updatedInventoryPart = inventoryPartResult.updateStock(
      updateStockDTO.quantityChange, 
      updateStockDTO.reason
    );

    // Sauvegarder les modifications
    await this.inventoryPartRepository.update(updatedInventoryPart);

    // Convertir en DTO de réponse
    return {
      id: updatedInventoryPart.id,
      name: updatedInventoryPart.name,
      category: updatedInventoryPart.category,
      referenceNumber: updatedInventoryPart.referenceNumber,
      currentStock: updatedInventoryPart.currentStock,
      minStockThreshold: updatedInventoryPart.minStockThreshold,
      unitPrice: updatedInventoryPart.unitPrice,
      motorcycleModels: updatedInventoryPart.motorcycleModels,
      createdAt: updatedInventoryPart.createdAt,
      updatedAt: updatedInventoryPart.updatedAt
    };
  }

  async findLowStockParts(): Promise<InventoryPartResponseDTO[]> {
    const lowStockParts = await this.inventoryPartRepository.findLowStockParts();
    
    return lowStockParts.map(part => ({
      id: part.id,
      name: part.name,
      category: part.category,
      referenceNumber: part.referenceNumber,
      currentStock: part.currentStock,
      minStockThreshold: part.minStockThreshold,
      unitPrice: part.unitPrice,
      motorcycleModels: part.motorcycleModels,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt
    }));
  }
}
