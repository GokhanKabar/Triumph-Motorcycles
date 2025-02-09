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
    // Log des données reçues pour le débogage
    console.log('Données reçues pour création de test ride:', createTestRideDto);

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
        // Log détaillé des erreurs de validation
        console.error('Erreurs de validation:', testRideResult.details);
        
        // Construire un message d'erreur plus informatif
        const errorMessages = Object.entries(testRideResult.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ');
        
        throw new TestRideValidationError(
          `Validation failed: ${errorMessages}`, 
          testRideResult.details
        );
      }

      // Log avant la sauvegarde
      console.log('Tentative de sauvegarde du test ride:', testRideResult);

      try {
        // Sauvegarder le test ride
        const savedTestRide = await this.testRideRepository.create(testRideResult);
        console.log('Test ride sauvegardé avec succès:', savedTestRide);

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
        console.error('Erreur lors de la sauvegarde du test ride:', saveError);
        throw saveError;
      }
    } catch (error) {
      console.error('Erreur complète lors de la création du test ride:', error);
      throw error;
    }
  }
}
