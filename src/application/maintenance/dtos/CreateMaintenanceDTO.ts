import { MaintenanceType, MaintenanceStatus } from '../../../domain/maintenance/entities/Maintenance';

export interface CreateMaintenanceDTO {
  motorcycleId: string;
  type: MaintenanceType;
  scheduledDate: Date;
  status: MaintenanceStatus;
  mileageAtMaintenance: number;
  technicianNotes?: string;
  replacedParts?: string[];
  totalCost?: number;
  nextMaintenanceRecommendation?: Date;
}
