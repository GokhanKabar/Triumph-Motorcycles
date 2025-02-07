import { IDriverRepository } from '../../../domain/driver/repositories/IDriverRepository';
import { DriverNotFoundError } from '../../../domain/driver/errors/DriverNotFoundError';

export class RecordDriverIncidentUseCase {
  constructor(private driverRepository: IDriverRepository) {}

  async execute(driverId: string, incident: string): Promise<void> {
    const driverResult = await this.driverRepository.findById(driverId);

    if (driverResult instanceof DriverNotFoundError) {
      throw driverResult;
    }

    const updatedDriver = driverResult.addIncident(incident);
    await this.driverRepository.update(updatedDriver);
  }
}
