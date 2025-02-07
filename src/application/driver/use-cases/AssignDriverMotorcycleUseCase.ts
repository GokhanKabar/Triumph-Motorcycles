import { IDriverRepository } from '../../../domain/driver/repositories/IDriverRepository';
import { DriverNotFoundError } from '../../../domain/driver/errors/DriverNotFoundError';

export class AssignDriverMotorcycleUseCase {
  constructor(private driverRepository: IDriverRepository) {}

  async execute(driverId: string, motorcycleId: string): Promise<void> {
    const driverResult = await this.driverRepository.findById(driverId);

    if (driverResult instanceof DriverNotFoundError) {
      throw driverResult;
    }

    const updatedDriver = driverResult.assignMotorcycle(motorcycleId);
    await this.driverRepository.update(updatedDriver);
  }
}
