import { MaintenanceResponseDTO } from '@application/maintenance/dtos/MaintenanceResponseDTO';

export interface IMaintenanceListProps {
  onComplete?: (maintenanceId: string) => void;
  onEdit?: (maintenance: MaintenanceResponseDTO) => void;
}

export interface IMaintenanceListState {
  maintenances: MaintenanceResponseDTO[];
  isLoading: boolean;
  error: Error | null;
}

export interface IPaginationConfig {
  page: number;
  rowsPerPage: number;
  totalItems: number;
}

export interface IMaintenanceListHandlers {
  handleCompleteMaintenance: (maintenanceId: string) => Promise<void>;
  getStatusColor: (status: string) => string;
}

export interface IPaginatedMaintenanceData {
  paginatedMaintenances: MaintenanceResponseDTO[];
  paginationConfig: IPaginationConfig;
}
