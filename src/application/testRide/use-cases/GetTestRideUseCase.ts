import { ITestRideRepository } from '../../../domain/testRide';
import { TestRideDto } from '../dtos/TestRideDto';
import { TestRideNotFoundError } from '../../../domain/testRide';

export class GetTestRideUseCase {
  constructor(private testRideRepository: ITestRideRepository) {}

  async getById(id: string): Promise<TestRideDto> {
    const testRide = await this.testRideRepository.findById(id);
    
    if (!testRide) {
      throw new TestRideNotFoundError(id);
    }

    return testRide.toJSON();
  }

  async getByConcessionId(concessionId: string): Promise<TestRideDto[]> {
    const testRides = await this.testRideRepository.findByConcessionId(concessionId);
    return testRides.map(tr => tr.toJSON());
  }

  async getByMotorcycleId(motorcycleId: string): Promise<TestRideDto[]> {
    const testRides = await this.testRideRepository.findByMotorcycleId(motorcycleId);
    return testRides.map(tr => tr.toJSON());
  }
}
