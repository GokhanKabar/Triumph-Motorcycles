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
      console.log('DEBUG: Récupération de toutes les maintenances');
      const maintenances = await this.maintenanceRepository.findAll();
      
      console.log(`DEBUG: Nombre de maintenances trouvées: ${maintenances.length}`);
      
      // Si pas de repository de moto, retourner les maintenances sans détails de moto
      if (!this.motorcycleRepository) {
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
          updatedAt: maintenance.updatedAt
        }));
      }

      // Récupérer les détails des motos en parallèle
      const motorcyclePromises = maintenances.map(maintenance => 
        this.motorcycleRepository!.findById(maintenance.motorcycleId)
      );
      const motorcycles = await Promise.all(motorcyclePromises);

      return maintenances.map((maintenance, index) => {
        const motorcycle = motorcycles[index];

        return {
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
          motorcycleDetails: motorcycle
        };
      });
    } catch (error) {
      console.error('DEBUG: Erreur lors de la récupération des maintenances', error);
      throw error;
    }
  }
}
