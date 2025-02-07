import { IInventoryPartRepository } from '../../domain/inventory/repositories/IInventoryPartRepository';
import InventoryPart, { PartCategory } from '../../domain/inventory/entities/InventoryPart';
import { InventoryPartNotFoundError } from '../../domain/inventory/errors/InventoryPartNotFoundError';
import { InventoryPartValidationError } from '../../domain/inventory/errors/InventoryPartValidationError';
import InventoryPartModel from '../frameworks/postgres/models/InventoryPartModel';
import { Op } from 'sequelize';

export class PostgreSQLInventoryPartRepository implements IInventoryPartRepository {
  async save(inventoryPart: InventoryPart): Promise<InventoryPart> {
    try {
      const savedPart = await InventoryPartModel.create({
        id: inventoryPart.id,
        name: inventoryPart.name,
        category: inventoryPart.category,
        referenceNumber: inventoryPart.referenceNumber,
        currentStock: inventoryPart.currentStock,
        minStockThreshold: inventoryPart.minStockThreshold,
        unitPrice: inventoryPart.unitPrice,
        motorcycleModels: inventoryPart.motorcycleModels
      });

      return InventoryPart.from(
        savedPart.name,
        savedPart.category,
        savedPart.referenceNumber,
        savedPart.currentStock,
        savedPart.minStockThreshold,
        savedPart.unitPrice,
        savedPart.motorcycleModels,
        savedPart.id
      ) as InventoryPart;
    } catch (error) {
      throw new InventoryPartValidationError(error.message);
    }
  }

  async findById(id: string): Promise<InventoryPart | InventoryPartNotFoundError> {
    const part = await InventoryPartModel.findByPk(id);
    
    if (!part) {
      return new InventoryPartNotFoundError(`Inventory Part with ID ${id} not found`);
    }

    return InventoryPart.from(
      part.name,
      part.category,
      part.referenceNumber,
      part.currentStock,
      part.minStockThreshold,
      part.unitPrice,
      part.motorcycleModels,
      part.id
    ) as InventoryPart;
  }

  async update(inventoryPart: InventoryPart): Promise<InventoryPart> {
    try {
      const updateData: any = {
        currentStock: inventoryPart.currentStock,
        minStockThreshold: inventoryPart.minStockThreshold,
        name: inventoryPart.name,
        referenceNumber: inventoryPart.referenceNumber,
        category: inventoryPart.category,
        unitPrice: inventoryPart.unitPrice,
        motorcycleModels: inventoryPart.motorcycleModels
      };

      // Supprimer les clés undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const [updatedRowsCount] = await InventoryPartModel.update(updateData, {
        where: { id: inventoryPart.id }
      });

      if (updatedRowsCount === 0) {
        throw new InventoryPartNotFoundError(`Inventory Part with ID ${inventoryPart.id} not found`);
      }

      return inventoryPart;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la pièce:', error);
      throw new InventoryPartValidationError(error.message);
    }
  }

  async decreaseStock(partId: string, quantity: number): Promise<InventoryPart | InventoryPartNotFoundError> {
    const part = await this.findById(partId);
    
    if (part instanceof InventoryPartNotFoundError) {
      return part;
    }

    if (part.currentStock < quantity) {
      throw new InventoryPartValidationError('Not enough stock');
    }

    const updatedPart = part.updateStock(-quantity);
    await this.update(updatedPart);

    return updatedPart;
  }

  async findLowStockParts(): Promise<InventoryPart[]> {
    const lowStockParts = await InventoryPartModel.findAll({
      where: {
        currentStock: {
          [Op.lte]: InventoryPartModel.sequelize.col('minStockThreshold')
        }
      }
    });

    return lowStockParts.map(part => 
      InventoryPart.from(
        part.name,
        part.category,
        part.referenceNumber,
        part.currentStock,
        part.minStockThreshold,
        part.unitPrice,
        part.motorcycleModels,
        part.id
      ) as InventoryPart
    );
  }

  async findByCategory(category: PartCategory): Promise<InventoryPart[]> {
    const parts = await InventoryPartModel.findAll({
      where: { category }
    });

    return parts.map(part => InventoryPart.from(
      part.name,
      part.category,
      part.referenceNumber,
      part.currentStock,
      part.minStockThreshold,
      part.unitPrice,
      part.motorcycleModels,
      part.id
    ) as InventoryPart);
  }

  async findByMotorcycleModel(model: string): Promise<InventoryPart[]> {
    const parts = await InventoryPartModel.findAll({
      where: {
        motorcycleModels: {
          [Op.contains]: [model]
        }
      }
    });

    return parts.map(part => InventoryPart.from(
      part.name,
      part.category,
      part.referenceNumber,
      part.currentStock,
      part.minStockThreshold,
      part.unitPrice,
      part.motorcycleModels,
      part.id
    ) as InventoryPart);
  }

  async delete(id: string): Promise<void> {
    const deletedCount = await InventoryPartModel.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      throw new InventoryPartNotFoundError(`Inventory Part with ID ${id} not found`);
    }
  }

  async increaseStock(id: string, quantity: number): Promise<void> {
    const part = await InventoryPartModel.findByPk(id);

    if (!part) {
      throw new InventoryPartNotFoundError(`Inventory Part with ID ${id} not found`);
    }

    part.currentStock += quantity;
    await part.save();
  }

  async findAll(): Promise<InventoryPart[]> {
    try {
      // Ensure the model is properly initialized
      if (!InventoryPartModel.isInitialized) {
        throw new Error('InventoryPartModel is not initialized');
      }

      // Fetch all parts with explicit column selection
      const parts = await InventoryPartModel.findAll({
        attributes: [
          'id', 
          'name', 
          'category', 
          'referenceNumber', 
          'currentStock', 
          'minStockThreshold', 
          'unitPrice', 
          'motorcycleModels'
        ]
      });

      // Log the number of parts found
      console.log(`Found ${parts.length} inventory parts`);

      // Map Sequelize models to domain entities
      return parts.map(part => {
        // Validate each part before mapping
        if (!part || !part.id) {
          console.warn('Skipping invalid inventory part:', part);
          return null;
        }

        return InventoryPart.from(
          part.name,
          part.category,
          part.referenceNumber,
          part.currentStock,
          part.minStockThreshold,
          part.unitPrice,
          part.motorcycleModels,
          part.id
        ) as InventoryPart;
      }).filter(part => part !== null);
    } catch (error) {
      // Log the full error details
      console.error('Error in findAll inventory parts:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Rethrow the error to be handled by the caller
      throw error;
    }
  }
}
