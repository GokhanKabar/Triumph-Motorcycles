import { IMaintenanceRepository } from '../../../domain/maintenance/repositories/IMaintenanceRepository';
import { MaintenanceResponseDTO } from '../dtos/MaintenanceResponseDTO';

export class FindDueMaintenancesUseCase {
  constructor(
    private maintenanceRepository: IMaintenanceRepository
  ) {}

  async execute(): Promise<MaintenanceResponseDTO[]> {
    const currentDate = new Date();
    const dueMaintenances = await this.maintenanceRepository.findDueMaintenances(currentDate);

    return dueMaintenances.map(maintenance => ({
      id: maintenance.id,
      motorcycleId: maintenance.motorcycleId,
      type: maintenance.type,
      status: maintenance.status,
      scheduledDate: maintenance.scheduledDate,
      createdAt: maintenance.createdAt,
      updatedAt: maintenance.updatedAt
    }));
  }
}
