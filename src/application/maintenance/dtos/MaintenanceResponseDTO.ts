import { MaintenanceType, MaintenanceStatus } from '../../../domain/maintenance/entities/Maintenance';

export interface MaintenanceResponseDTO {
  id: string;
  motorcycleId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: Date;
  actualDate?: Date;
  mileageAtMaintenance?: number;
  technicianNotes?: string;
  replacedParts?: string[];
  totalCost?: number;
  nextMaintenanceRecommendation?: Date;
  createdAt: Date;
  updatedAt: Date;
  motorcycle?: {
    id: string;
    brand: string;
    model: string;
    vin: string;
    year: number;
  };
}
