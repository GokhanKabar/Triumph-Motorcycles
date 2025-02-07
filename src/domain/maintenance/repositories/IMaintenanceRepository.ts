import Maintenance, { MaintenanceType, MaintenanceStatus } from '../entities/Maintenance';
import { MaintenanceNotFoundError } from '../errors/MaintenanceNotFoundError';
import { CreateMaintenanceDTO } from './CreateMaintenanceDTO';
import { MaintenanceResponseDTO } from './MaintenanceResponseDTO';

export interface IMaintenanceRepository {
  findById(id: string): Promise<Maintenance | MaintenanceNotFoundError>;
  findByMotorcycleId(motorcycleId: string): Promise<Maintenance[]>;
  findByType(type: MaintenanceType): Promise<Maintenance[]>;
  findByStatus(status: MaintenanceStatus): Promise<Maintenance[]>;
  findDueMaintenances(currentDate: Date): Promise<Maintenance[]>;
  findAll(): Promise<Maintenance[]>;
  save(maintenance: Maintenance): Promise<void>;
  update(maintenance: Maintenance): Promise<void>;
  update(
    maintenanceId: string, 
    maintenanceData: CreateMaintenanceDTO
  ): Promise<MaintenanceResponseDTO>;
  delete(id: string): Promise<void>;
}
