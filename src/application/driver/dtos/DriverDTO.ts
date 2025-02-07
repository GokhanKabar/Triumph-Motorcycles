import { LicenseType, DriverStatus } from '../../../domain/driver/entities/Driver';

export { DriverStatus };

export interface CreateDriverDTO {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpirationDate: Date;
  status?: DriverStatus;
  companyId?: string;
  currentMotorcycleId?: string;
  drivingExperience?: number;
}

export interface DriverDTO {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpirationDate: Date;
  status: DriverStatus;
  companyId?: string;
  currentMotorcycleId?: string;
  drivingExperience?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignMotorcycleDTO {
  driverId: string;
  motorcycleId: string;
}

export interface RecordIncidentDTO {
  driverId: string;
  incident: string;
}
