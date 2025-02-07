import { IMaintenanceRepository } from '../../../domain/maintenance/repositories/IMaintenanceRepository';
import { IMotorcycleRepository } from '../../../domain/motorcycle/repositories/IMotorcycleRepository';
import Maintenance from '../../../domain/maintenance/entities/Maintenance';
import { CreateMaintenanceDTO } from '../dtos/CreateMaintenanceDTO';
import { MaintenanceResponseDTO } from '../dtos/MaintenanceResponseDTO';
import { MaintenanceValidationError } from '../../../domain/maintenance/errors/MaintenanceValidationError';
import { MaintenanceType, MaintenanceStatus } from '../../../domain/maintenance/entities/Maintenance';

export class CreateMaintenanceUseCase {
  constructor(
    private maintenanceRepository: IMaintenanceRepository,
    private motorcycleRepository: IMotorcycleRepository
  ) {}

  async execute(
    createMaintenanceDTO: CreateMaintenanceDTO
  ): Promise<MaintenanceResponseDTO | MaintenanceValidationError> {
    console.log('Début de CreateMaintenanceUseCase.execute');
    console.log('DTO reçu:', JSON.stringify(createMaintenanceDTO, null, 2));

    // Conversion et validation du kilométrage
    const mileageValue = typeof createMaintenanceDTO.mileageAtMaintenance === 'string'
      ? parseInt(createMaintenanceDTO.mileageAtMaintenance, 10)
      : createMaintenanceDTO.mileageAtMaintenance || 0;

    // Limiter le kilométrage à la plage d'un entier signé
    const MAX_INTEGER = 2147483647; // 2^31 - 1
    const MIN_INTEGER = -2147483648; // -2^31

    const safetyMileage = Math.max(
      MIN_INTEGER, 
      Math.min(MAX_INTEGER, mileageValue)
    );

    // Conversion explicite des types
    const safeMaintenanceDTO: CreateMaintenanceDTO = {
      motorcycleId: createMaintenanceDTO.motorcycleId,
      type: createMaintenanceDTO.type as MaintenanceType,
      scheduledDate: (() => {
        // Conversion explicite et sécurisée de la date
        if (createMaintenanceDTO.scheduledDate instanceof Date) {
          return createMaintenanceDTO.scheduledDate;
        }
        
        if (typeof createMaintenanceDTO.scheduledDate === 'string') {
          const parsedDate = new Date(createMaintenanceDTO.scheduledDate);
          // Vérifier si la date est valide
          return isNaN(parsedDate.getTime()) 
            ? new Date() 
            : parsedDate;
        }
        
        return new Date(); // Valeur par défaut si aucune date valide
      })(),
      status: (createMaintenanceDTO.status || MaintenanceStatus.SCHEDULED) as MaintenanceStatus,
      mileageAtMaintenance: safetyMileage,
      technicianNotes: createMaintenanceDTO.technicianNotes || '',
      replacedParts: Array.isArray(createMaintenanceDTO.replacedParts) 
        ? createMaintenanceDTO.replacedParts 
        : [],
      totalCost: createMaintenanceDTO.totalCost 
        ? (typeof createMaintenanceDTO.totalCost === 'string' 
          ? parseFloat(createMaintenanceDTO.totalCost) 
          : createMaintenanceDTO.totalCost)
        : 0,
      nextMaintenanceRecommendation: createMaintenanceDTO.nextMaintenanceRecommendation 
        ? (createMaintenanceDTO.nextMaintenanceRecommendation instanceof Date 
          ? createMaintenanceDTO.nextMaintenanceRecommendation 
          : new Date(createMaintenanceDTO.nextMaintenanceRecommendation)) 
        : undefined
    };

    // Ajouter actualDate si le statut est COMPLETED
    if (safeMaintenanceDTO.status === MaintenanceStatus.COMPLETED) {
      safeMaintenanceDTO.actualDate = new Date();
    }

    console.log('DTO sécurisé:', JSON.stringify(safeMaintenanceDTO, null, 2));

    // Validation des champs requis
    if (!safeMaintenanceDTO.motorcycleId) {
      console.error('motorcycleId manquant');
      return new MaintenanceValidationError('Motorcycle ID is required');
    }

    if (!safeMaintenanceDTO.type) {
      console.error('type manquant');
      return new MaintenanceValidationError('Maintenance type is required');
    }

    if (!safeMaintenanceDTO.scheduledDate) {
      console.error('scheduledDate manquant');
      return new MaintenanceValidationError('Scheduled date is required');
    }

    console.log('Recherche de la moto avec ID:', safeMaintenanceDTO.motorcycleId);
    // Vérifier que la moto existe
    const motorcycle = await this.motorcycleRepository.findById(safeMaintenanceDTO.motorcycleId);
    if (motorcycle instanceof Error) {
      console.error('Moto non trouvée');
      return new MaintenanceValidationError('Motorcycle not found');
    }

    console.log('Moto trouvée:', JSON.stringify(motorcycle, null, 2));

    // Créer l'entretien avec des valeurs par défaut
    const maintenanceResult = Maintenance.from(
      undefined, // id
      safeMaintenanceDTO.motorcycleId,
      safeMaintenanceDTO.type,
      safeMaintenanceDTO.scheduledDate,
      safeMaintenanceDTO.status,
      safeMaintenanceDTO.mileageAtMaintenance,
      // Forcer actualDate si le statut est COMPLETED ou SCHEDULED
      safeMaintenanceDTO.status === MaintenanceStatus.COMPLETED || 
      safeMaintenanceDTO.status === MaintenanceStatus.SCHEDULED 
        ? new Date() 
        : undefined, 
      safeMaintenanceDTO.technicianNotes,
      safeMaintenanceDTO.replacedParts,
      safeMaintenanceDTO.totalCost,
      safeMaintenanceDTO.nextMaintenanceRecommendation
    );

    console.log('Résultat de Maintenance.from():', JSON.stringify(maintenanceResult, null, 2));

    if (maintenanceResult instanceof MaintenanceValidationError) {
      console.error('Erreur de validation de maintenance:', maintenanceResult);
      return maintenanceResult;
    }

    console.log('Sauvegarde de la maintenance');
    // Sauvegarder l'entretien
    await this.maintenanceRepository.save(maintenanceResult);

    console.log('Conversion en DTO de réponse');
    // Convertir en DTO de réponse
    const responseDTO = {
      id: maintenanceResult.id,
      motorcycleId: maintenanceResult.motorcycleId,
      type: maintenanceResult.type,
      status: maintenanceResult.status,
      scheduledDate: maintenanceResult.scheduledDate,
      mileageAtMaintenance: maintenanceResult.mileageAtMaintenance,
      actualDate: maintenanceResult.actualDate || new Date(), // Forcer actualDate
      createdAt: maintenanceResult.createdAt,
      updatedAt: maintenanceResult.updatedAt
    };

    console.log('DTO de réponse:', JSON.stringify(responseDTO, null, 2));
    return responseDTO;
  }
}
