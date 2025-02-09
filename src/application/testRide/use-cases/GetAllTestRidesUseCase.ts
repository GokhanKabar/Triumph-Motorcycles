import { ITestRideRepository } from '../../../domain/testRide/repositories/ITestRideRepository';
import { TestRideDto } from '../dtos/TestRideDto';

export class GetAllTestRidesUseCase {
  constructor(private readonly testRideRepository: ITestRideRepository) {}

  async execute(): Promise<TestRideDto[]> {
    const testRides = await this.testRideRepository.findAll();
    return testRides.map(testRide => ({
      id: testRide.id,
      concessionId: testRide.concessionId,
      concessionName: testRide.concessionName,
      motorcycleId: testRide.motorcycleId,
      motorcycleName: testRide.motorcycleName,
      firstName: testRide.firstName,
      lastName: testRide.lastName,
      email: testRide.email,
      phoneNumber: testRide.phoneNumber,
      desiredDate: testRide.desiredDate,
      status: testRide.status,
      riderExperience: testRide.riderExperience,
      licenseType: testRide.licenseType,
      licenseNumber: testRide.licenseNumber,
      hasTrainingCertificate: testRide.hasTrainingCertificate,
      preferredRideTime: testRide.preferredRideTime,
      additionalRequirements: testRide.additionalRequirements,
      message: testRide.message,
      createdAt: testRide.createdAt,
      updatedAt: testRide.updatedAt
    }));
  }
}
