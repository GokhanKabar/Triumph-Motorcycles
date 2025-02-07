import { DriverResponseDTO } from '@application/user/dtos/DriverResponseDTO';

export interface IDriverListProps {
  onAssignMotorcycle?: (driverId: string, motorcycleId: string) => void;
  onRecordIncident?: (driverId: string, incidentData: any) => void;
  onEdit?: (driver: DriverResponseDTO) => void;
}

export interface IDriverListState {
  drivers: DriverResponseDTO[];
  isLoading: boolean;
  error: Error | null;
}

export interface IPaginationConfig {
  page: number;
  rowsPerPage: number;
  totalItems: number;
}

export interface IDriverListHandlers {
  handleMotorcycleAssignment: (driverId: string, motorcycleId: string) => Promise<void>;
  handleIncidentRecord: (driverId: string, incidentData: any) => Promise<void>;
  getStatusColor: (status: string) => string;
}

export interface IPaginatedDriverData {
  paginatedDrivers: DriverResponseDTO[];
  paginationConfig: IPaginationConfig;
}
