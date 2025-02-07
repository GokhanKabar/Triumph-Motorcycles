import { IMaintenanceRepository } from '../../../domain/maintenance/repositories/IMaintenanceRepository';
import { IInventoryPartRepository } from '../../../domain/maintenance/repositories/IInventoryPartRepository';
import { MaintenanceNotFoundError } from '../../../domain/maintenance/errors/MaintenanceNotFoundError';
import { MaintenanceResponseDTO } from '../dtos/MaintenanceResponseDTO';
import { MaintenanceStatus } from '../../../domain/maintenance/entities/Maintenance';

export interface CompleteMaintenanceDTO {
  maintenanceId: string;
  actualDate: Date;
  mileageAtMaintenance: number;
  technicianNotes?: string;
  replacedParts?: { partId: string; quantity: number }[];
  totalCost?: number;
  nextMaintenanceRecommendation?: Date;
}

export class CompleteMaintenanceUseCase {
  constructor(
    private maintenanceRepository: IMaintenanceRepository,
    private inventoryPartRepository: IInventoryPartRepository
  ) {}

  async execute(
    completeMaintenanceDTO: CompleteMaintenanceDTO
  ): Promise<MaintenanceResponseDTO | MaintenanceNotFoundError> {
    // Rechercher l'entretien
    const maintenanceResult = await this.maintenanceRepository.findById(completeMaintenanceDTO.maintenanceId);
    
    if (maintenanceResult instanceof MaintenanceNotFoundError) {
      return maintenanceResult;
    }

    // Gérer le stock des pièces remplacées
    if (completeMaintenanceDTO.replacedParts) {
      for (const part of completeMaintenanceDTO.replacedParts) {
        await this.inventoryPartRepository.decreaseStock(part.partId, part.quantity);
      }
    }

    // Compléter l'entretien
    const completedMaintenance = maintenanceResult.complete(
      completeMaintenanceDTO.actualDate,
      completeMaintenanceDTO.mileageAtMaintenance,
      completeMaintenanceDTO.technicianNotes,
      completeMaintenanceDTO.replacedParts?.map(p => p.partId),
      completeMaintenanceDTO.totalCost,
      completeMaintenanceDTO.nextMaintenanceRecommendation
    );

    // Mettre à jour l'entretien
    await this.maintenanceRepository.update(completedMaintenance.id, {
      motorcycleId: completedMaintenance.motorcycleId,
      type: completedMaintenance.type,
      scheduledDate: completedMaintenance.scheduledDate,
      status: completedMaintenance.status,
      mileageAtMaintenance: completedMaintenance.mileageAtMaintenance,
      technicianNotes: completedMaintenance.technicianNotes,
      replacedParts: completedMaintenance.replacedParts,
      totalCost: completedMaintenance.totalCost,
      nextMaintenanceRecommendation: completedMaintenance.nextMaintenanceRecommendation,
      actualDate: completedMaintenance.actualDate
    });

    // Convertir en DTO de réponse
    return {
      id: completedMaintenance.id,
      motorcycleId: completedMaintenance.motorcycleId,
      type: completedMaintenance.type,
      status: completedMaintenance.status,
      scheduledDate: completedMaintenance.scheduledDate,
      actualDate: completedMaintenance.actualDate,
      mileageAtMaintenance: completedMaintenance.mileageAtMaintenance,
      technicianNotes: completedMaintenance.technicianNotes,
      replacedParts: completedMaintenance.replacedParts,
      totalCost: completedMaintenance.totalCost,
      nextMaintenanceRecommendation: completedMaintenance.nextMaintenanceRecommendation,
      createdAt: completedMaintenance.createdAt,
      updatedAt: completedMaintenance.updatedAt
    };
  }
}
