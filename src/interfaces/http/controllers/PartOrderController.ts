import { Request, Response, NextFunction } from 'express';
import { CreatePartOrderDto } from '@application/partOrder/dtos/PartOrderDto';
import { CreatePartOrderUseCase } from '@application/partOrder/use-cases/CreatePartOrderUseCase';
import { IPartOrderRepository } from '@domain/partOrder/repositories/IPartOrderRepository';
import { ValidationService, ValidationError } from '@infrastructure/services/ValidationService';
import PartOrderNotFoundError from '@domain/partOrder/errors/PartOrderNotFoundError';
import { ManagePartOrderStatusUseCase } from '@application/partOrder/use-cases/ManagePartOrderStatusUseCase';

export class PartOrderController {
    constructor(
        private createPartOrderUseCase: CreatePartOrderUseCase,
        private partOrderRepository: IPartOrderRepository,
        private managePartOrderStatusUseCase: ManagePartOrderStatusUseCase,
        private validationService: ValidationService
    ) { }

    async create(req: Request, res: Response): Promise<void> {
        try {
            // Validation des données d'entrée
            const validationResult = await this.validationService.validate(req.body, 'createPartOrder');

            const partOrderData: CreatePartOrderDto = req.body;
            const createdPartOrder = await this.createPartOrderUseCase.execute(partOrderData);

            res.status(201).json(createdPartOrder);
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({
                    message: 'Erreur de validation',
                    errors: error.errors
                });
            } else {
                res.status(500).json({
                    message: 'Erreur lors de la création de la commande de pièces',
                    error: error.message
                });
            }
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { status, supplier } = req.query;

            let partOrders;
            if (status) {
                partOrders = await this.partOrderRepository.findByStatus(status as string);
            } else if (supplier) {
                partOrders = await this.partOrderRepository.findBySupplier(supplier as string);
            } else {
                // If no filters are provided, fetch all part orders
                partOrders = await this.partOrderRepository.findAll();
            }

            // Validate the result
            if (!partOrders || partOrders.length === 0) {
                res.status(404).json({
                    message: 'Aucune commande de pièces trouvée',
                    data: []
                });
                return;
            }

            res.status(200).json(partOrders);
        } catch (error) {
            res.status(500).json({
                message: 'Erreur lors de la récupération des commandes de pièces',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
            });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const partOrder = await this.partOrderRepository.findById(id);

            if (partOrder instanceof Error) {
                res.status(404).json({
                    message: 'Commande de pièce non trouvée',
                    error: partOrder.message
                });
                return;
            }

            res.status(200).json(partOrder);
        } catch (error) {
            res.status(404).json({
                message: 'Commande de pièce non trouvée',
                error: error.message
            });
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validation des données d'entrée
            try {
                await this.validationService.validate({ status }, 'updatePartOrderStatus');
            } catch (validationError) {
                res.status(400).json({
                    message: 'Erreur de validation',
                    errors: validationError.errors
                });
                return;
            }

            // Mettre à jour le statut de la commande
            const updatedPartOrder = await this.managePartOrderStatusUseCase.execute(id, status);

            // Gérer l'erreur si la commande n'est pas trouvée
            if (updatedPartOrder instanceof PartOrderNotFoundError) {
                res.status(404).json({
                    message: 'Commande de pièce non trouvée',
                    error: updatedPartOrder.message
                });
                return;
            }
            res.status(200).json(updatedPartOrder);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Vérifier si la commande existe avant de la supprimer
            const existingPartOrder = await this.partOrderRepository.findById(id);

            if (existingPartOrder instanceof Error) {
                res.status(404).json({
                    message: 'Commande de pièce non trouvée',
                    error: existingPartOrder.message
                });
                return;
            }

            // Supprimer la commande
            try {
                await this.partOrderRepository.delete(id);
                res.status(200).json({
                    message: 'Commande de pièce supprimée avec succès',
                    id
                });
            } catch (deleteError) {
                res.status(500).json({
                    message: 'Erreur lors de la suppression de la commande',
                    error: deleteError.message
                });
            }
        } catch (error) {
            next(error);
        }
    }
}
