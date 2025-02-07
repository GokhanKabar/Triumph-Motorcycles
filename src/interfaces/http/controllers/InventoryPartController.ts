import { Request, Response, NextFunction } from 'express';
import { CreateInventoryPartDTO } from '@application/inventory/dtos/CreateInventoryPartDTO';
import { InventoryPartResponseDTO } from '@application/inventory/dtos/InventoryPartResponseDTO';
import { CreateInventoryPartUseCase } from '@application/inventory/use-cases/CreateInventoryPartUseCase';
import { ManageInventoryStockUseCase } from '@application/inventory/use-cases/ManageInventoryStockUseCase';
import { IInventoryPartRepository } from '@domain/inventory/repositories/IInventoryPartRepository';
import { UpdateStockDTO } from '@application/inventory/dtos/UpdateStockDTO';
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
      console.error('Erreur lors de la création de la pièce d\'inventaire:', error);
      
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
        console.warn('No inventory parts found');
        res.status(404).json({ 
          message: 'Aucune pièce d\'inventaire trouvée',
          data: [] 
        });
        return;
      }

      // Log the number of inventory parts retrieved
      console.log(`Retrieved ${inventoryParts.length} inventory parts`);

      res.status(200).json(inventoryParts);
    } catch (error) {
      console.error('Erreur lors de la récupération des pièces d\'inventaire:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

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
      console.error('Erreur lors de la récupération de la pièce d\'inventaire:', error);
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

      console.log('DEBUG: Mise à jour de la pièce', { 
        id, 
        inventoryPartData,
        headers: req.headers 
      });

      // Validation des données d'entrée
      try {
        await this.validationService.validate(inventoryPartData, 'updateInventoryPart');
      } catch (validationError) {
        console.error('DEBUG: Erreur de validation', validationError);
        res.status(400).json({ 
          message: 'Erreur de validation', 
          errors: validationError.errors 
        });
        return;
      }
      
      // Trouver d'abord la pièce existante
      const existingPart = await this.inventoryPartRepository.findById(id);
      
      if (existingPart instanceof Error) {
        console.error('DEBUG: Pièce non trouvée', { id, error: existingPart.message });
        res.status(404).json({ 
          message: 'Pièce d\'inventaire non trouvée', 
          error: existingPart.message 
        });
        return;
      }

      // Mettre à jour les propriétés de la pièce
      Object.keys(inventoryPartData).forEach(key => {
        if (key !== 'id') {
          console.log(`DEBUG: Mise à jour du champ ${key}`, { 
            oldValue: (existingPart as any)[key], 
            newValue: inventoryPartData[key] 
          });
          (existingPart as any)[key] = inventoryPartData[key];
        }
      });

      // Sauvegarder la mise à jour
      try {
        const updatedPart = await this.inventoryPartRepository.update(existingPart);
        
        console.log('DEBUG: Pièce mise à jour avec succès', { updatedPart });
        res.status(200).json(updatedPart);
      } catch (updateError) {
        console.error('DEBUG: Erreur lors de la mise à jour de la pièce', updateError);
        res.status(500).json({ 
          message: 'Erreur lors de la mise à jour de la pièce', 
          error: updateError.message 
        });
      }
    } catch (error) {
      console.error('DEBUG: Erreur inattendue lors de la mise à jour de la pièce', error);
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      console.log('DEBUG: Tentative de suppression de la pièce', { id });

      // Vérifier si la pièce existe avant de la supprimer
      const existingPart = await this.inventoryPartRepository.findById(id);
      
      if (existingPart instanceof Error) {
        console.error('DEBUG: Pièce non trouvée', { id, error: existingPart.message });
        res.status(404).json({ 
          message: 'Pièce d\'inventaire non trouvée', 
          error: existingPart.message 
        });
        return;
      }

      // Vérifier si la pièce a du stock
      if ((existingPart as any).currentStock > 0) {
        console.warn('DEBUG: Tentative de suppression d\'une pièce avec du stock', { 
          id, 
          currentStock: (existingPart as any).currentStock 
        });
        res.status(400).json({ 
          message: 'Impossible de supprimer une pièce avec du stock en inventaire',
          currentStock: (existingPart as any).currentStock
        });
        return;
      }

      // Supprimer la pièce
      try {
        await this.inventoryPartRepository.delete(id);
        
        console.log('DEBUG: Pièce supprimée avec succès', { id });
        res.status(200).json({ 
          message: 'Pièce d\'inventaire supprimée avec succès',
          id 
        });
      } catch (deleteError) {
        console.error('DEBUG: Erreur lors de la suppression de la pièce', deleteError);
        res.status(500).json({ 
          message: 'Erreur lors de la suppression de la pièce', 
          error: deleteError.message 
        });
      }
    } catch (error) {
      console.error('DEBUG: Erreur inattendue lors de la suppression de la pièce', error);
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
      console.error('Erreur lors de la gestion du stock:', error);
      
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
