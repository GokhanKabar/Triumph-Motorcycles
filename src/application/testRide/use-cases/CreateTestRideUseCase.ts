import { TestRide, ITestRideRepository } from '../../../domain/testRide';
import { CreateTestRideDto, TestRideDto } from '../dtos/TestRideDto';
import { TestRideValidationError } from '../../../domain/testRide/errors/TestRideValidationError';
import { TestRideStatus, RiderExperience, LicenseType } from '../../../domain/testRide/entities/TestRide';

export class CreateTestRideUseCase {
  constructor(
    private testRideRepository: ITestRideRepository
  ) {}

  async execute(
    createTestRideDto: CreateTestRideDto
  ): Promise<TestRideDto> {
    try {
      // Créer le test ride avec des valeurs par défaut
      const testRideResult = await TestRide.from(
        undefined,
        createTestRideDto.concessionId,
        createTestRideDto.motorcycleId,
        createTestRideDto.motorcycleName || 'Moto non spécifiée',
        createTestRideDto.firstName,
        createTestRideDto.lastName,
        createTestRideDto.email,
        createTestRideDto.phoneNumber,
        createTestRideDto.desiredDate,
        createTestRideDto.riderExperience || RiderExperience.BEGINNER,
        createTestRideDto.licenseType || LicenseType.A2,
        createTestRideDto.licenseNumber || 'NON_RENSEIGNE',
        createTestRideDto.hasTrainingCertificate ?? false,
        createTestRideDto.preferredRideTime,
        createTestRideDto.additionalRequirements,
        createTestRideDto.message,
        TestRideStatus.PENDING,
        undefined,
        undefined
      );

      // Vérifier s'il y a une erreur de validation
      if (testRideResult instanceof TestRideValidationError) {
        // Construire un message d'erreur plus informatif
        const errorMessages = Object.entries(testRideResult.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ');
        
        throw new TestRideValidationError(
          `Validation failed: ${errorMessages}`, 
          testRideResult.details
        );
      }

      try {
        // Sauvegarder le test ride
        const savedTestRide = await this.testRideRepository.create(testRideResult);

        // Convertir en DTO de réponse
        return {
          id: savedTestRide.id,
          concessionId: savedTestRide.concessionId,
          motorcycleId: savedTestRide.motorcycleId,
          motorcycleName: savedTestRide.motorcycleName,
          firstName: savedTestRide.firstName,
          lastName: savedTestRide.lastName,
          email: savedTestRide.email,
          phoneNumber: savedTestRide.phoneNumber,
          desiredDate: savedTestRide.desiredDate,
          status: savedTestRide.status,
          riderExperience: savedTestRide.riderExperience,
          licenseType: savedTestRide.licenseType,
          licenseNumber: savedTestRide.licenseNumber,
          hasTrainingCertificate: savedTestRide.hasTrainingCertificate,
          preferredRideTime: savedTestRide.preferredRideTime,
          additionalRequirements: savedTestRide.additionalRequirements,
          message: savedTestRide.message,
          createdAt: savedTestRide.createdAt,
          updatedAt: savedTestRide.updatedAt
        };
      } catch (saveError) {
        throw saveError;
      }
    } catch (error) {
      throw error;
    }
  }
}
