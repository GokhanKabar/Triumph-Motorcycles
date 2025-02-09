import { Request, Response } from 'express';
import { CreateMaintenanceDTO } from '../../../application/maintenance/dtos/CreateMaintenanceDTO';
import { CreateMaintenanceUseCase } from '../../../application/maintenance/use-cases/CreateMaintenanceUseCase';
import { CompleteMaintenanceUseCase } from '../../../application/maintenance/use-cases/CompleteMaintenanceUseCase';
import { FindDueMaintenancesUseCase } from '../../../application/maintenance/use-cases/FindDueMaintenancesUseCase';
import { FindAllMaintenancesUseCase } from '../../../application/maintenance/use-cases/FindAllMaintenancesUseCase';
import { DeleteMaintenanceUseCase } from '../../../application/maintenance/use-cases/DeleteMaintenanceUseCase';
import { UpdateMaintenanceUseCase } from '../../../application/maintenance/use-cases/UpdateMaintenanceUseCase';
import { IMotorcycleRepository } from '../../../domain/motorcycle/repositories/IMotorcycleRepository';
import { MaintenanceType, MaintenanceStatus } from '../../../domain/maintenance/entities/Maintenance';
import { UserRole } from '../../../domain/enums/UserRole';

export class MaintenanceController {
  private createMaintenanceUseCase: CreateMaintenanceUseCase;
  private completeMaintenanceUseCase: CompleteMaintenanceUseCase;
  private findDueMaintenancesUseCase: FindDueMaintenancesUseCase;
  private findAllMaintenancesUseCase: FindAllMaintenancesUseCase;
  private deleteMaintenanceUseCase: DeleteMaintenanceUseCase;
  private updateMaintenanceUseCase: UpdateMaintenanceUseCase;
  private motorcycleRepository: IMotorcycleRepository;

  constructor(
    createMaintenanceUseCase: CreateMaintenanceUseCase,
    completeMaintenanceUseCase: CompleteMaintenanceUseCase,
    findDueMaintenancesUseCase: FindDueMaintenancesUseCase,
    findAllMaintenancesUseCase: FindAllMaintenancesUseCase,
    deleteMaintenanceUseCase: DeleteMaintenanceUseCase,
    updateMaintenanceUseCase: UpdateMaintenanceUseCase,
    private motorcycleRepository: IMotorcycleRepository
  ) {
    this.createMaintenanceUseCase = createMaintenanceUseCase;
    this.completeMaintenanceUseCase = completeMaintenanceUseCase;
    this.findDueMaintenancesUseCase = findDueMaintenancesUseCase;
    this.findAllMaintenancesUseCase = findAllMaintenancesUseCase;
    this.deleteMaintenanceUseCase = deleteMaintenanceUseCase;
    this.updateMaintenanceUseCase = updateMaintenanceUseCase;
  }

  async createMaintenance(req: Request, res: Response): Promise<void> {
    try {
      console.log('Requête de création de maintenance reçue');
      console.log('Corps de la requête:', JSON.stringify(req.body, null, 2));

      // Extraction et validation des données
      const { 
        motorcycleId, 
        type, 
        scheduledDate, 
        status, 
        mileageAtMaintenance,
        technicianNotes,
        replacedParts,
        totalCost,
        nextMaintenanceRecommendation
      } = req.body;

      // Validation des champs requis
      if (!motorcycleId) {
        console.error('motorcycleId manquant');
        res.status(400).json({ message: 'motorcycleId est requis' });
        return;
      }

      if (!type) {
        console.error('type manquant');
        res.status(400).json({ message: 'type est requis' });
        return;
      }

      // Formater les données avec des valeurs par défaut
      const maintenanceData: CreateMaintenanceDTO = {
        motorcycleId,
        type: type as MaintenanceType,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        status: (status || MaintenanceStatus.SCHEDULED) as MaintenanceStatus,
        mileageAtMaintenance: mileageAtMaintenance 
          ? (typeof mileageAtMaintenance === 'string' 
            ? parseInt(mileageAtMaintenance, 10) 
            : mileageAtMaintenance)
          : 0,
        technicianNotes: technicianNotes || '',
        replacedParts: Array.isArray(replacedParts) ? replacedParts : [],
        totalCost: totalCost 
          ? (typeof totalCost === 'string' 
            ? parseFloat(totalCost) 
            : totalCost)
          : 0,
        nextMaintenanceRecommendation: nextMaintenanceRecommendation 
          ? new Date(nextMaintenanceRecommendation)
          : undefined
      };

      console.log('Données de maintenance formatées:', JSON.stringify(maintenanceData, null, 2));

      // Vérifier que la moto existe (avec gestion d'erreur)
      try {
        const motorcycle = await this.motorcycleRepository.findById(maintenanceData.motorcycleId);
        if (!motorcycle) {
          console.error('Moto non trouvée');
          res.status(404).json({ message: 'Moto non trouvée' });
          return;
        }
      } catch (error) {
        console.error('Erreur lors de la recherche de la moto:', error);
        res.status(500).json({ message: 'Erreur lors de la vérification de la moto' });
        return;
      }

      const maintenance = await this.createMaintenanceUseCase.execute(maintenanceData);
      
      console.log('Maintenance créée avec succès');
      res.status(201).json(maintenance);
    } catch (error) {
      console.error('Erreur détaillée lors de la création de maintenance:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création de maintenance',
        error: error.message,
        stack: error.stack
      });
    }
  }

  async getAllMaintenances(req: Request, res: Response): Promise<void> {
    try {
      console.log('DEBUG: getAllMaintenances - DEBUT');
      console.log('DEBUG: Headers de la requête:', JSON.stringify(req.headers, null, 2));
      console.log('DEBUG: Utilisateur connecté:', JSON.stringify(req.user, null, 2));

      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        console.error('DEBUG: Utilisateur non authentifié');
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      // Vérifier explicitement le rôle
      console.log('DEBUG: Rôle de l\'utilisateur:', req.user.role);
      console.log('DEBUG: Type du rôle:', typeof req.user.role);
      console.log('DEBUG: Comparaison avec UserRole.ADMIN:', req.user.role === UserRole.ADMIN);

      // Récupérer toutes les maintenances avec l'ID utilisateur
      const maintenances = await this.findAllMaintenancesUseCase.execute(
        req.user.id, 
        req.user.role
      );
      
      console.log('DEBUG: Nombre de maintenances récupérées:', maintenances.length);
      console.log('DEBUG: Détails des maintenances:', JSON.stringify(maintenances, null, 2));
      
      res.status(200).json(maintenances);
    } catch (error) {
      console.error('DEBUG: Erreur COMPLETE lors de la récupération des maintenances:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des maintenances',
        errorMessage: error.message,
        errorStack: error.stack
      });
    }
  }

  async completeMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const { maintenanceId } = req.params;
      const completionDetails = req.body;
      const completeMaintenanceDTO = {
        maintenanceId,
        ...completionDetails
      };
      const maintenance = await this.completeMaintenanceUseCase.execute(completeMaintenanceDTO);
      res.status(200).json(maintenance);
    } catch (error) {
      console.error('Erreur lors de la complétion de maintenance:', error);
      res.status(500).json({ message: 'Erreur lors de la complétion de maintenance' });
    }
  }

  async findDueMaintenances(req: Request, res: Response): Promise<void> {
    try {
      const dueMaintenances = await this.findDueMaintenancesUseCase.execute();
      res.status(200).json(dueMaintenances);
    } catch (error) {
      console.error('Erreur lors de la récupération des maintenances dues:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des maintenances dues' });
    }
  }

  async deleteMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const { maintenanceId } = req.params;
      await this.deleteMaintenanceUseCase.execute(maintenanceId);
      res.status(204).send(); // No content, successful deletion
    } catch (error) {
      console.error('Erreur lors de la suppression de maintenance:', error);
      if (error.name === 'MaintenanceNotFoundError') {
        res.status(404).json({ message: 'Maintenance non trouvée' });
      } else {
        res.status(500).json({ message: 'Erreur lors de la suppression de maintenance' });
      }
    }
  }

  async updateMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const maintenanceId = req.params.id;
      const maintenanceData = req.body;

      // Valider les données de maintenance
      if (!maintenanceId) {
        res.status(400).json({ message: 'ID de maintenance requis' });
        return;
      }

      // Vérifier si la maintenance existe
      const existingMaintenance = await this.findAllMaintenancesUseCase.execute();
      const maintenanceToUpdate = existingMaintenance.find(m => m.id === maintenanceId);

      if (!maintenanceToUpdate) {
        res.status(404).json({ message: 'Maintenance non trouvée' });
        return;
      }

      // Mettre à jour la maintenance
      const updatedMaintenance = await this.updateMaintenanceUseCase.execute(
        maintenanceId, 
        maintenanceData
      );

      res.status(200).json(updatedMaintenance);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la maintenance:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour de la maintenance',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}
