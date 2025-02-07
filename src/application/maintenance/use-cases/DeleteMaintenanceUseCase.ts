import { IMaintenanceRepository } from '@domain/maintenance/repositories/IMaintenanceRepository';
import { MaintenanceNotFoundError } from '@domain/maintenance/errors/MaintenanceNotFoundError';

export class DeleteMaintenanceUseCase {
  private maintenanceRepository: IMaintenanceRepository;

  constructor(maintenanceRepository: IMaintenanceRepository) {
    this.maintenanceRepository = maintenanceRepository;
  }

  async execute(maintenanceId: string): Promise<void> {
    try {
      // Vérifier si la maintenance existe avant de supprimer
      await this.maintenanceRepository.findById(maintenanceId);
      
      // Supprimer la maintenance
      await this.maintenanceRepository.delete(maintenanceId);
    } catch (error) {
      if (error instanceof MaintenanceNotFoundError) {
        throw error;
      }
      
      throw new Error(`Impossible de supprimer la maintenance : ${error.message}`);
    }
  }
}
