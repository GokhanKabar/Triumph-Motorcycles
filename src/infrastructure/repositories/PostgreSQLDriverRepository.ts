import { IDriverRepository } from '../../domain/driver/repositories/IDriverRepository';
import Driver, { LicenseType, DriverStatus } from '../../domain/driver/entities/Driver';
import DriverValidationError from '../../domain/driver/errors/DriverValidationError';
import DriverModel from '../frameworks/postgres/models/DriverModel';
import { Op } from 'sequelize';
import { default as DriverNotFoundError } from '../../domain/driver/errors/DriverNotFoundError';

export class PostgreSQLDriverRepository implements IDriverRepository {
  async save(driver: Driver): Promise<Driver> {
    try {
      const savedDriver = await DriverModel.create({
        id: driver.id,
        userId: driver.userId,
        firstName: driver.firstName,
        lastName: driver.lastName,
        licenseNumber: driver.licenseNumber,
        licenseType: driver.licenseType,
        licenseExpirationDate: driver.licenseExpirationDate,
        status: driver.status,
        companyId: driver.companyId,
        currentMotorcycleId: driver.currentMotorcycleId
      });

      return Driver.from(
        savedDriver.userId,
        savedDriver.firstName,
        savedDriver.lastName,
        savedDriver.licenseNumber,
        savedDriver.licenseType,
        savedDriver.licenseExpirationDate,
        savedDriver.status,
        savedDriver.companyId,
        savedDriver.id
      ) as Driver;
    } catch (error) {
      throw new DriverValidationError(error.message);
    }
  }

  async findById(id: string): Promise<Driver | DriverNotFoundError> {
    const driver = await DriverModel.findByPk(id);
    
    if (!driver) {
      return new DriverNotFoundError(`Driver with ID ${id} not found`);
    }

    return Driver.from(
      driver.userId,
      driver.firstName,
      driver.lastName,
      driver.licenseNumber,
      driver.licenseType,
      driver.licenseExpirationDate,
      driver.status,
      driver.companyId,
      driver.id
    ) as Driver;
  }

  async update(id: string, driverData: Partial<Driver>): Promise<Driver> {
    try {
      const driver = await DriverModel.findByPk(id);
      
      if (!driver) {
        throw new DriverNotFoundError(`Driver with ID ${id} not found`);
      }

      // Mise à jour des champs fournis
      await driver.update({
        firstName: driverData.firstName ?? driver.firstName,
        lastName: driverData.lastName ?? driver.lastName,
        licenseNumber: driverData.licenseNumber ?? driver.licenseNumber,
        licenseType: driverData.licenseType ?? driver.licenseType,
        licenseExpirationDate: driverData.licenseExpirationDate ?? driver.licenseExpirationDate,
        status: driverData.status ?? driver.status,
        companyId: driverData.companyId ?? driver.companyId,
        currentMotorcycleId: driverData.currentMotorcycleId ?? driver.currentMotorcycleId,
        drivingExperience: driverData.drivingExperience ?? driver.drivingExperience
      });

      // Recharger le conducteur mis à jour
      await driver.reload();

      return Driver.from(
        driver.userId,
        driver.firstName,
        driver.lastName,
        driver.licenseNumber,
        driver.licenseType,
        driver.licenseExpirationDate,
        driver.status,
        driver.companyId,
        driver.currentMotorcycleId,
        driver.drivingExperience,
        driver.id,
        driver.createdAt,
        driver.updatedAt
      ) as Driver;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du conducteur:', error);
      throw new DriverValidationError(error.message);
    }
  }

  async findExpiredLicenses(currentDate: Date): Promise<Driver[]> {
    const expiredDrivers = await DriverModel.findAll({
      where: {
        licenseExpirationDate: {
          [Op.lte]: currentDate
        },
        status: DriverStatus.ACTIVE
      }
    });

    return expiredDrivers.map(driver => 
      Driver.from(
        driver.userId,
        driver.firstName,
        driver.lastName,
        driver.licenseNumber,
        driver.licenseType,
        driver.licenseExpirationDate,
        driver.status,
        driver.companyId,
        driver.id
      ) as Driver
    );
  }

  async findAvailableDrivers(): Promise<Driver[]> {
    const availableDrivers = await DriverModel.findAll({
      where: {
        status: DriverStatus.ACTIVE,
        currentMotorcycleId: null
      }
    });

    return availableDrivers.map(driver => 
      Driver.from(
        driver.userId,
        driver.firstName,
        driver.lastName,
        driver.licenseNumber,
        driver.licenseType,
        driver.licenseExpirationDate,
        driver.status,
        driver.companyId,
        driver.id
      ) as Driver
    );
  }

  async findAll(): Promise<Driver[]> {
    const drivers = await DriverModel.findAll();

    console.log('DEBUG: Drivers from database', {
      driversCount: drivers.length,
      firstDriver: drivers[0] ? {
        id: drivers[0].id,
        firstName: drivers[0].firstName,
        lastName: drivers[0].lastName,
        licenseNumber: drivers[0].licenseNumber,
        licenseType: drivers[0].licenseType,
        licenseExpirationDate: drivers[0].licenseExpirationDate,
        status: drivers[0].status,
        companyId: drivers[0].companyId,
        currentMotorcycleId: drivers[0].currentMotorcycleId,
        drivingExperience: drivers[0].drivingExperience
      } : null
    });

    const mappedDrivers = drivers.map(driver => {
      console.log('DEBUG: Mapping driver', {
        driverId: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName
      });

      const driverInstance = Driver.from(
        driver.firstName,
        driver.lastName,
        driver.licenseNumber,
        driver.licenseType,
        driver.licenseExpirationDate,
        driver.status,
        driver.companyId,
        driver.currentMotorcycleId,
        driver.drivingExperience,
        driver.id,
        driver.createdAt,
        driver.updatedAt
      );

      if (driverInstance instanceof Error) {
        console.error('Erreur lors de la création du conducteur:', driverInstance);
        return null;
      }

      return driverInstance;
    }).filter(driver => driver !== null);

    console.log('DEBUG: Mapped Drivers', {
      mappedDriversCount: mappedDrivers.length,
      firstMappedDriver: mappedDrivers[0] ? {
        id: mappedDrivers[0].id,
        firstName: mappedDrivers[0].firstName,
        lastName: mappedDrivers[0].lastName
      } : null
    });

    return mappedDrivers;
  }

  async findByUserId(userId: string): Promise<Driver | DriverNotFoundError> {
    const driver = await DriverModel.findOne({ where: { userId } });
    
    if (!driver) {
      return new DriverNotFoundError(`Driver with userId ${userId} not found`);
    }

    return Driver.from(
      driver.userId,
      driver.firstName,
      driver.lastName,
      driver.licenseNumber,
      driver.licenseType,
      driver.licenseExpirationDate,
      driver.status,
      driver.companyId,
      driver.id
    ) as Driver;
  }

  async findByCompanyId(companyId: string): Promise<Driver[]> {
    const drivers = await DriverModel.findAll({ where: { companyId } });

    return drivers.map(driver => 
      Driver.from(
        driver.userId,
        driver.firstName,
        driver.lastName,
        driver.licenseNumber,
        driver.licenseType,
        driver.licenseExpirationDate,
        driver.status,
        driver.companyId,
        driver.id
      ) as Driver
    );
  }

  async findByLicenseType(licenseType: LicenseType): Promise<Driver[]> {
    const drivers = await DriverModel.findAll({ where: { licenseType } });

    return drivers.map(driver => 
      Driver.from(
        driver.userId,
        driver.firstName,
        driver.lastName,
        driver.licenseNumber,
        driver.licenseType,
        driver.licenseExpirationDate,
        driver.status,
        driver.companyId,
        driver.id
      ) as Driver
    );
  }

  async findByStatus(status: DriverStatus): Promise<Driver[]> {
    const drivers = await DriverModel.findAll({ where: { status } });

    return drivers.map(driver => 
      Driver.from(
        driver.userId,
        driver.firstName,
        driver.lastName,
        driver.licenseNumber,
        driver.licenseType,
        driver.licenseExpirationDate,
        driver.status,
        driver.companyId,
        driver.id
      ) as Driver
    );
  }

  async delete(id: string): Promise<void> {
    const deletedCount = await DriverModel.destroy({ where: { id } });
    
    if (deletedCount === 0) {
      throw new DriverNotFoundError(`Driver with ID ${id} not found`);
    }
  }
}
