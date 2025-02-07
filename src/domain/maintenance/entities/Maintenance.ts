import { MissingRequiredFieldError } from '../../errors/MissingRequiredFieldError';
import { v4 as uuidv4 } from 'uuid';

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CURATIVE = 'CURATIVE'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class MaintenanceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MaintenanceValidationError';
  }
}

export default class Maintenance {
  private constructor(
    public readonly id: string,
    public readonly motorcycleId: string,
    public readonly type: MaintenanceType,
    public readonly scheduledDate: Date,
    public readonly status: MaintenanceStatus,
    public readonly mileageAtMaintenance: number,
    public readonly actualDate?: Date,
    public readonly technicianNotes?: string,
    public readonly replacedParts?: string[],
    public readonly totalCost?: number,
    public readonly nextMaintenanceRecommendation?: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) { }

  public static from(
    id: string | undefined,
    motorcycleId: string,
    type: MaintenanceType,
    scheduledDate: Date,
    status: MaintenanceStatus,
    mileageAtMaintenance: number,
    actualDate?: Date,
    technicianNotes?: string,
    replacedParts?: string[],
    totalCost?: number,
    nextMaintenanceRecommendation?: Date,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    // Validations
    if (!motorcycleId) {
      return new MissingRequiredFieldError('Motorcycle ID is required');
    }

    if (!type) {
      return new MissingRequiredFieldError('Maintenance type is required');
    }

    if (!scheduledDate) {
      return new MissingRequiredFieldError('Scheduled date is required');
    }

    if (!status) {
      return new MissingRequiredFieldError('Maintenance status is required');
    }

    if (typeof mileageAtMaintenance !== 'number' || mileageAtMaintenance < 0) {
      return new MaintenanceValidationError('Mileage must be a non-negative number');
    }

    return new Maintenance(
      id || uuidv4(),
      motorcycleId,
      type,
      scheduledDate,
      status,
      mileageAtMaintenance,
      actualDate,
      technicianNotes,
      replacedParts || [],
      totalCost,
      nextMaintenanceRecommendation,
      createdAt || new Date(),
      updatedAt || new Date(),
    );
  }

  public update(
    motorcycleId?: string,
    type?: MaintenanceType,
    scheduledDate?: Date,
    status?: MaintenanceStatus,
    mileageAtMaintenance?: number,
    actualDate?: Date,
    technicianNotes?: string,
    replacedParts?: string[],
    totalCost?: number,
    nextMaintenanceRecommendation?: Date,
  ) {
    return new Maintenance(
      this.id,
      motorcycleId || this.motorcycleId,
      type || this.type,
      scheduledDate || this.scheduledDate,
      status || this.status,
      mileageAtMaintenance || this.mileageAtMaintenance,
      actualDate || this.actualDate,
      technicianNotes || this.technicianNotes,
      replacedParts || this.replacedParts,
      totalCost || this.totalCost,
      nextMaintenanceRecommendation || this.nextMaintenanceRecommendation,
      this.createdAt,
      new Date(),
    );
  }

  // Méthode pour compléter une maintenance
  public complete(
    actualDate: Date,
    mileageAtMaintenance: number,
    technicianNotes?: string, 
    replacedParts?: string[], 
    totalCost?: number,
    nextMaintenanceRecommendation?: Date
  ): Maintenance {
    return new Maintenance(
      this.id,
      this.motorcycleId,
      this.type,
      this.scheduledDate,
      MaintenanceStatus.COMPLETED,
      mileageAtMaintenance,
      actualDate,
      technicianNotes || this.technicianNotes,
      replacedParts || this.replacedParts,
      totalCost || this.totalCost,
      nextMaintenanceRecommendation || this.nextMaintenanceRecommendation,
      this.createdAt,
      new Date()
    );
  }

  // Méthode utilitaire pour nettoyer les données avant sérialisation
  private sanitizeForJSON(value: any): any {
    if (value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) {
      return value.map(item => 
        typeof item === 'string' 
          ? item.replace(/[^\x20-\x7E]/g, '') // Supprimer les caractères non-ASCII
          : item
      );
    }
    return value;
  }

  // Méthode pour convertir l'entité en objet simple
  toJSON(): Record<string, any> {
    return {
      id: this.sanitizeForJSON(this.id),
      motorcycleId: this.sanitizeForJSON(this.motorcycleId),
      type: this.sanitizeForJSON(this.type),
      scheduledDate: this.sanitizeForJSON(this.scheduledDate),
      status: this.sanitizeForJSON(this.status),
      mileageAtMaintenance: this.sanitizeForJSON(this.mileageAtMaintenance),
      actualDate: this.sanitizeForJSON(this.actualDate),
      technicianNotes: this.sanitizeForJSON(this.technicianNotes),
      replacedParts: this.sanitizeForJSON(this.replacedParts),
      totalCost: this.sanitizeForJSON(this.totalCost),
      nextMaintenanceRecommendation: this.sanitizeForJSON(this.nextMaintenanceRecommendation),
      createdAt: this.sanitizeForJSON(this.createdAt),
      updatedAt: this.sanitizeForJSON(this.updatedAt)
    };
  }
}
