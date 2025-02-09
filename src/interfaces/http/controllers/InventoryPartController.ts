import { Request, Response, NextFunction } from 'express';
import { CreateInventoryPartDTO } from '@application/inventory/dtos/CreateInventoryPartDTO';
import { CreateInventoryPartUseCase } from '@application/inventory/use-cases/CreateInventoryPartUseCase';
import { ManageInventoryStockUseCase } from '@application/inventory/use-cases/ManageInventoryStockUseCase';
import { IInventoryPartRepository } from '@domain/inventory/repositories/IInventoryPartRepository';
import { ValidationService, ValidationError } from '@infrastructure/services/ValidationService';
import { InventoryPartNotFoundError } from '@domain/inventory/errors/InventoryPartNotFoundError';

export class InventoryPartController {
  constructor(
    private createInventoryPartUseCase: CreateInventoryPartUseCase,
    private manageInventoryStockUseCase: ManageInventoryStockUseCase,
    private inventoryPartRepository: IInventoryPartRepository,
    private validationService: ValidationService
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données d'entrée
      const validationResult = await this.validationService.validate(req.body, 'createInventoryPart');
      
      const inventoryPartData: CreateInventoryPartDTO = req.body;
      const createdInventoryPart = await this.createInventoryPartUseCase.execute(inventoryPartData);
      
      res.status(201).json(createdInventoryPart);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          message: 'Erreur de validation',
          errors: error.errors
        });
      } else {
        res.status(500).json({ 
          message: 'Erreur lors de la création de la pièce d\'inventaire', 
          error: error.message 
        });
      }
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { category, model } = req.query;
      
      let inventoryParts;
      if (category) {
        inventoryParts = await this.inventoryPartRepository.findByCategory(category as string);
      } else if (model) {
        inventoryParts = await this.inventoryPartRepository.findByMotorcycleModel(model as string);
      } else {
        // If no filters are provided, fetch all inventory parts
        inventoryParts = await this.inventoryPartRepository.findAll();
      }

      // Validate the result
      if (!inventoryParts || inventoryParts.length === 0) {
        res.status(404).json({ 
          message: 'Aucune pièce d\'inventaire trouvée',
          data: [] 
        });
        return;
      }

      res.status(200).json(inventoryParts);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des pièces d\'inventaire', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const inventoryPart = await this.inventoryPartRepository.findById(id);
      
      if (inventoryPart instanceof Error) {
        res.status(404).json({ 
          message: 'Pièce d\'inventaire non trouvée', 
          error: inventoryPart.message 
        });
        return;
      }

      res.status(200).json(inventoryPart);
    } catch (error) {
      res.status(404).json({ 
        message: 'Pièce d\'inventaire non trouvée', 
        error: error.message 
      });
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const inventoryPartData = req.body;
      // Validation des données d'entrée
      try {
        await this.validationService.validate(inventoryPartData, 'updateInventoryPart');
      } catch (validationError) {
        res.status(400).json({ 
          message: 'Erreur de validation', 
          errors: validationError.errors 
        });
        return;
      }
      
      // Trouver d'abord la pièce existante
      const existingPart = await this.inventoryPartRepository.findById(id);
      
      if (existingPart instanceof Error) {
        res.status(404).json({ 
          message: 'Pièce d\'inventaire non trouvée', 
          error: existingPart.message 
        });
        return;
      }

      // Mettre à jour les propriétés de la pièce
      Object.keys(inventoryPartData).forEach(key => {
        if (key !== 'id') {
          (existingPart as any)[key] = inventoryPartData[key];
        }
      });

      // Sauvegarder la mise à jour
      try {
        const updatedPart = await this.inventoryPartRepository.update(existingPart);
        res.status(200).json(updatedPart);
      } catch (updateError) {
        res.status(500).json({ 
          message: 'Erreur lors de la mise à jour de la pièce', 
          error: updateError.message 
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Vérifier si la pièce existe avant de la supprimer
      const existingPart = await this.inventoryPartRepository.findById(id);
      
      if (existingPart instanceof Error) {
        res.status(404).json({ 
          message: 'Pièce d\'inventaire non trouvée', 
          error: existingPart.message 
        });
        return;
      }

      // Vérifier si la pièce a du stock
      if ((existingPart as any).currentStock > 0) {
        res.status(400).json({ 
          message: 'Impossible de supprimer une pièce avec du stock en inventaire',
          currentStock: (existingPart as any).currentStock
        });
        return;
      }

      // Supprimer la pièce
      try {
        await this.inventoryPartRepository.delete(id);
        res.status(200).json({ 
          message: 'Pièce d\'inventaire supprimée avec succès',
          id 
        });
      } catch (deleteError) {
        res.status(500).json({ 
          message: 'Erreur lors de la suppression de la pièce', 
          error: deleteError.message 
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async manageStock(req: Request, res: Response): Promise<void> {
    try {
      const { id: partId } = req.params;
      const { quantity, action, reason } = req.body;

      // Déterminer le changement de quantité
      const quantityChange = action === 'remove' ? -quantity : quantity;

      // Validation des données d'entrée
      await this.validationService.validate({
        partId,
        quantityChange,
        action
      }, 'manageStock');

      // Gérer le stock
      const updatedPart = await this.manageInventoryStockUseCase.execute({
        partId,
        quantityChange,
        reason
      });

      // Gérer l'erreur si la pièce n'est pas trouvée
      if (updatedPart instanceof InventoryPartNotFoundError) {
        res.status(404).json({
          message: 'Pièce d\'inventaire non trouvée',
          error: updatedPart.message
        });
        return;
      }
      res.status(200).json(updatedPart);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          message: 'Erreur de validation',
          errors: error.errors
        });
      } else {
        res.status(500).json({ 
          message: 'Erreur lors de la gestion du stock', 
          error: error.message 
        });
      }
    }
  }
}
