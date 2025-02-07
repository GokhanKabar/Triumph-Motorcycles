import { MaintenanceRepository } from '../repositories/MaintenanceRepository';
import { CreateMaintenanceDTO } from '../dtos/CreateMaintenanceDTO';
import { MaintenanceResponseDTO } from '../dtos/MaintenanceResponseDTO';

export class UpdateMaintenanceUseCase {
  constructor(private maintenanceRepository: MaintenanceRepository) {}

  async execute(
    maintenanceId: string, 
    maintenanceData: CreateMaintenanceDTO
  ): Promise<MaintenanceResponseDTO> {
    // Validation des données
    if (!maintenanceId) {
      throw new Error('ID de maintenance requis');
    }

    // Mettre à jour la maintenance
    const updatedMaintenance = await this.maintenanceRepository.update(
      maintenanceId, 
      maintenanceData
    );

    return updatedMaintenance;
  }
}
