import { ITestRideRepository } from '../../../domain/testRide/repositories/ITestRideRepository';
import { TestRideNotFoundError } from '../../../domain/testRide/errors/TestRideValidationError';

export class DeleteTestRideUseCase {
  constructor(private readonly testRideRepository: ITestRideRepository) {}

  async execute(id: string): Promise<void> {
    const existingTestRide = await this.testRideRepository.findById(id);
    
    if (!existingTestRide) {
      throw new TestRideNotFoundError(id);
    }

    await this.testRideRepository.delete(id);
  }
}
