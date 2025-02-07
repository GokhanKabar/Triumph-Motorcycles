import Driver, { LicenseType, DriverStatus } from '../../../domain/driver/entities/Driver';
import { IDriverRepository } from '../../../domain/driver/repositories/IDriverRepository';
import { DriverValidationError } from '../../../domain/driver/errors/DriverValidationError';

export class CreateDriverUseCase {
  constructor(private driverRepository: IDriverRepository) {}

  async execute(
    userId: string,
    firstName: string,
    lastName: string,
    licenseNumber: string,
    licenseType: LicenseType,
    licenseExpirationDate: Date,
    status: DriverStatus = DriverStatus.ACTIVE,
    companyId?: string
  ): Promise<Driver> {
    try {
      const driverResult = Driver.from(
        userId,
        firstName,
        lastName,
        licenseNumber,
        licenseType,
        licenseExpirationDate,
        status,
        companyId
      );

      if (driverResult instanceof Error) {
        throw new DriverValidationError(driverResult.message);
      }

      const driver = driverResult as Driver;
      await this.driverRepository.save(driver);
      return driver;
    } catch (error) {
      throw new DriverValidationError(error.message);
    }
  }
}
