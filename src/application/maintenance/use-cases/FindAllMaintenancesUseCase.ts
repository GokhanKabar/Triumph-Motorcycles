import { IMaintenanceRepository } from '../../../domain/maintenance/repositories/IMaintenanceRepository';
import { IMotorcycleRepository } from '../../../domain/motorcycle/repositories/IMotorcycleRepository';
import { MaintenanceResponseDTO } from '../dtos/MaintenanceResponseDTO';
import { UserRole } from '../../../domain/enums/UserRole';

export class FindAllMaintenancesUseCase {
  constructor(
    private maintenanceRepository: IMaintenanceRepository,
    private motorcycleRepository?: IMotorcycleRepository
  ) {}

  async execute(userId: string | null, userRole: UserRole): Promise<MaintenanceResponseDTO[]> {
    console.log('DEBUG: FindAllMaintenancesUseCase - Paramètres reçus', { userId, userRole });

    try {
      const maintenances = await this.maintenanceRepository.findAll();

      return maintenances.map(maintenance => ({
        id: maintenance.id,
        motorcycleId: maintenance.motorcycleId,
        type: maintenance.type,
        status: maintenance.status,
        scheduledDate: maintenance.scheduledDate,
        mileageAtMaintenance: maintenance.mileageAtMaintenance,
        actualDate: maintenance.actualDate,
        technicianNotes: maintenance.technicianNotes,
        replacedParts: maintenance.replacedParts,
        totalCost: maintenance.totalCost,
        nextMaintenanceRecommendation: maintenance.nextMaintenanceRecommendation,
        createdAt: maintenance.createdAt,
        updatedAt: maintenance.updatedAt,
        motorcycle: maintenance.motorcycle ? {
          id: maintenance.motorcycle.id,
          brand: maintenance.motorcycle.brand,
          model: maintenance.motorcycle.model,
          year: maintenance.motorcycle.year,
          vin: maintenance.motorcycle.vin,
          mileage: maintenance.motorcycle.mileage,
          status: maintenance.motorcycle.status,
          concessionId: maintenance.motorcycle.concessionId
        } : undefined
      }));
    } catch (error) {
      throw error;
    }
  }
}
