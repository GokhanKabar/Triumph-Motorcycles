import Driver, { LicenseType, DriverStatus } from '../entities/Driver';
import { DriverNotFoundError } from '../errors/DriverNotFoundError';

export interface IDriverRepository {
  findById(id: string): Promise<Driver | DriverNotFoundError>;
  findByUserId(userId: string): Promise<Driver | DriverNotFoundError>;
  findByCompanyId(companyId: string): Promise<Driver[]>;
  findByLicenseType(licenseType: LicenseType): Promise<Driver[]>;
  findByStatus(status: DriverStatus): Promise<Driver[]>;
  findExpiredLicenses(currentDate: Date): Promise<Driver[]>;
  findAvailableDrivers(): Promise<Driver[]>;
  findAll(): Promise<Driver[]>;
  save(driver: Driver): Promise<void>;
  update(driver: Driver): Promise<void>;
  delete(id: string): Promise<void>;
}
