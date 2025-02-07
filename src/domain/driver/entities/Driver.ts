import { v4 as uuidv4 } from 'uuid';

export enum LicenseType {
  A1 = 'A1',
  A2 = 'A2',
  A = 'A'
}

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export default class Driver {
  private constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly licenseNumber: string,
    public readonly licenseType: LicenseType,
    public readonly licenseExpirationDate: Date,
    public readonly status: DriverStatus,
    public readonly companyId?: string,
    public readonly currentMotorcycleId?: string,
    public readonly drivingExperience?: number, // in years
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static from(
    firstName: string,
    lastName: string,
    licenseNumber: string,
    licenseType: LicenseType,
    licenseExpirationDate: Date,
    status: DriverStatus = DriverStatus.ACTIVE,
    companyId?: string,
    currentMotorcycleId?: string,
    drivingExperience?: number,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ): Driver | Error {
    if (!firstName || !lastName || !licenseNumber) {
      return new Error('First name, last name, and license number are required');
    }

    return new Driver(
      id || uuidv4(),
      firstName,
      lastName,
      licenseNumber,
      licenseType,
      licenseExpirationDate,
      status,
      companyId,
      currentMotorcycleId,
      drivingExperience,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public assignMotorcycle(motorcycleId: string): Driver {
    return new Driver(
      this.id,
      this.firstName,
      this.lastName,
      this.licenseNumber,
      this.licenseType,
      this.licenseExpirationDate,
      this.status,
      this.companyId,
      motorcycleId,
      this.drivingExperience,
      this.createdAt,
      new Date()
    );
  }

  public isLicenseValid(): boolean {
    return new Date() < this.licenseExpirationDate;
  }
}
