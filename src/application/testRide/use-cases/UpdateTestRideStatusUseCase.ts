import { ITestRideRepository } from '../../../domain/testRide/repositories/ITestRideRepository';
import TestRide, { TestRideStatus } from '../../../domain/testRide/entities/TestRide';
import { TestRideNotFoundError } from '../../../domain/testRide';

export interface UpdateTestRideStatusDTO {
  id: string;
  status: TestRideStatus;
}

export class UpdateTestRideStatusUseCase {
  constructor(private readonly testRideRepository: ITestRideRepository) {}

  async execute(updateData: UpdateTestRideStatusDTO): Promise<TestRide> {
    console.log('Données de mise à jour reçues:', updateData);

    // Vérifier si le test ride existe
    const existingTestRide = await this.testRideRepository.findById(updateData.id);
    
    if (!existingTestRide) {
      console.error('Test ride non trouvé:', updateData.id);
      throw new TestRideNotFoundError(updateData.id);
    }

    console.log('Test ride existant:', existingTestRide);

    // Créer une nouvelle instance de TestRide avec le statut mis à jour
    const updatedTestRideOrError = await TestRide.from(
      existingTestRide.id,
      existingTestRide.concessionId,
      existingTestRide.motorcycleId,
      existingTestRide.motorcycleName,
      existingTestRide.firstName,
      existingTestRide.lastName,
      existingTestRide.email,
      existingTestRide.phoneNumber,
      existingTestRide.desiredDate,
      existingTestRide.riderExperience,
      existingTestRide.licenseType,
      existingTestRide.licenseNumber,
      existingTestRide.hasTrainingCertificate,
      existingTestRide.preferredRideTime,
      existingTestRide.additionalRequirements,
      existingTestRide.message,
      updateData.status,
      existingTestRide.createdAt,
      new Date() // Mettre à jour la date de modification
    );

    // Gérer les erreurs potentielles de validation
    if (updatedTestRideOrError instanceof Error) {
      console.error('Erreur de validation:', updatedTestRideOrError);
      throw updatedTestRideOrError;
    }

    console.log('Test ride mis à jour:', updatedTestRideOrError);

    // Mettre à jour le test ride
    try {
      const savedTestRide = await this.testRideRepository.update(updatedTestRideOrError);
      console.log('Test ride sauvegardé:', savedTestRide);
      return savedTestRide;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }
}
