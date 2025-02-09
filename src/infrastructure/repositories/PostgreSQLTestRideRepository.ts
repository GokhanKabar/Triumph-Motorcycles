import { ITestRideRepository } from '../../domain/testRide/repositories/ITestRideRepository';
import TestRide, { TestRideStatus } from '../../domain/testRide/entities/TestRide';
import { TestRideNotFoundError } from '../../domain/testRide';
import TestRideModel from '../frameworks/postgres/models/TestRideModel'; 
import ConcessionModel from '../frameworks/postgres/models/ConcessionModel';
import { UniqueConstraintError, Op } from 'sequelize';
import { RiderExperience, LicenseType } from '../../domain/testRide/entities/TestRide';

export class PostgreSQLTestRideRepository implements ITestRideRepository {
  async create(testRide: TestRide): Promise<TestRide> {
    try {
      // Récupérer le nom de la concession
      const concessionModel = await ConcessionModel.findByPk(testRide.concessionId);
      const concessionName = concessionModel ? concessionModel.name : 'Concession non spécifiée';

      console.log('Création de test ride:', {
        id: testRide.id,
        concessionId: testRide.concessionId,
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
        licenseNumber: testRide.licenseNumber
      });

      const createdTestRide = await TestRideModel.create({
        id: testRide.id || undefined,
        concessionId: testRide.concessionId || 'concession_non_specifiee',
        motorcycleId: testRide.motorcycleId || 'moto_non_specifiee',
        motorcycleName: testRide.motorcycleName || 'Moto non spécifiée',
        firstName: testRide.firstName || 'Utilisateur',
        lastName: testRide.lastName || 'Anonyme',
        email: testRide.email || 'email_non_renseigne@example.com',
        phoneNumber: testRide.phoneNumber || '+33000000000',
        desiredDate: testRide.desiredDate || new Date(),
        status: testRide.status || TestRideStatus.PENDING,
        riderExperience: testRide.riderExperience || RiderExperience.BEGINNER,
        licenseType: testRide.licenseType || LicenseType.A2,
        licenseNumber: testRide.licenseNumber || 'NON_RENSEIGNE',
        hasTrainingCertificate: testRide.hasTrainingCertificate ?? false,
        preferredRideTime: testRide.preferredRideTime || '',
        additionalRequirements: testRide.additionalRequirements || '',
        message: testRide.message || '',
        createdAt: testRide.createdAt || new Date(),
        updatedAt: testRide.updatedAt || new Date()
      });

      console.log('Test ride créé avec succès:', {
        id: createdTestRide.id,
        motorcycleName: createdTestRide.motorcycleName
      });

      // Retourner un nouvel objet TestRide avec le nom de la concession
      return TestRide.from(
        createdTestRide.id,
        createdTestRide.concessionId,
        createdTestRide.motorcycleId,
        createdTestRide.motorcycleName,
        createdTestRide.firstName,
        createdTestRide.lastName,
        createdTestRide.email,
        createdTestRide.phoneNumber,
        createdTestRide.desiredDate,
        createdTestRide.riderExperience,
        createdTestRide.licenseType,
        createdTestRide.licenseNumber,
        createdTestRide.hasTrainingCertificate,
        createdTestRide.preferredRideTime,
        createdTestRide.additionalRequirements,
        createdTestRide.message,
        createdTestRide.status,
        createdTestRide.createdAt,
        createdTestRide.updatedAt,
        concessionName
      );
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error('Une réservation similaire existe déjà');
      }
      console.error('Erreur lors de la création du test ride:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<TestRide | null> {
    const testRideModel = await TestRideModel.findByPk(id);
    if (!testRideModel) return null;

    try {
      // Récupérer le nom de la concession
      const concessionModel = await ConcessionModel.findByPk(testRideModel.concessionId);
      const concessionName = concessionModel ? concessionModel.name : 'Concession non spécifiée';

      const testRideOrError = await TestRide.from(
        testRideModel.id,
        testRideModel.concessionId,
        testRideModel.motorcycleId,
        testRideModel.motorcycleName,
        testRideModel.firstName,
        testRideModel.lastName,
        testRideModel.email,
        testRideModel.phoneNumber,
        testRideModel.desiredDate,
        testRideModel.riderExperience,
        testRideModel.licenseType,
        testRideModel.licenseNumber,
        testRideModel.hasTrainingCertificate,
        testRideModel.preferredRideTime,
        testRideModel.additionalRequirements,
        testRideModel.message,
        testRideModel.status as TestRideStatus,
        testRideModel.createdAt,
        testRideModel.updatedAt,
        concessionName
      );

      if (!(testRideOrError instanceof Error)) {
        return testRideOrError;
      } else {
        throw new Error('Données de réservation corrompues dans la base de données');
      }
    } catch (error) {
      console.error('Erreur lors du traitement d\'un test ride:', error);
      throw new Error('Erreur lors du traitement d\'un test ride');
    }
  }

  async findByConcessionId(concessionId: string): Promise<TestRide[]> {
    const testRideModels = await TestRideModel.findAll({
      where: { concessionId }
    });

    const testRides: TestRide[] = [];
    for (const model of testRideModels) {
      try {
        // Récupérer le nom de la concession
        const concessionModel = await ConcessionModel.findByPk(model.concessionId);
        const concessionName = concessionModel ? concessionModel.name : 'Concession non spécifiée';

        const testRideOrError = await TestRide.from(
          model.id,
          model.concessionId,
          model.motorcycleId,
          model.motorcycleName,
          model.firstName,
          model.lastName,
          model.email,
          model.phoneNumber,
          model.desiredDate,
          model.riderExperience,
          model.licenseType,
          model.licenseNumber,
          model.hasTrainingCertificate,
          model.preferredRideTime,
          model.additionalRequirements,
          model.message,
          model.status as TestRideStatus,
          model.createdAt,
          model.updatedAt,
          concessionName
        );

        if (!(testRideOrError instanceof Error)) {
          testRides.push(testRideOrError);
        } else {
          console.error('Erreur lors de la création d\'un test ride:', testRideOrError);
        }
      } catch (error) {
        console.error('Erreur lors du traitement d\'un test ride:', error);
      }
    }

    return testRides;
  }

  async findByMotorcycleId(motorcycleId: string): Promise<TestRide[]> {
    const testRideModels = await TestRideModel.findAll({
      where: { motorcycleId }
    });

    const testRides: TestRide[] = [];
    for (const model of testRideModels) {
      try {
        // Récupérer le nom de la concession
        const concessionModel = await ConcessionModel.findByPk(model.concessionId);
        const concessionName = concessionModel ? concessionModel.name : 'Concession non spécifiée';

        const testRideOrError = await TestRide.from(
          model.id,
          model.concessionId,
          model.motorcycleId,
          model.motorcycleName,
          model.firstName,
          model.lastName,
          model.email,
          model.phoneNumber,
          model.desiredDate,
          model.riderExperience,
          model.licenseType,
          model.licenseNumber,
          model.hasTrainingCertificate,
          model.preferredRideTime,
          model.additionalRequirements,
          model.message,
          model.status as TestRideStatus,
          model.createdAt,
          model.updatedAt,
          concessionName
        );

        if (!(testRideOrError instanceof Error)) {
          testRides.push(testRideOrError);
        } else {
          console.error('Erreur lors de la création d\'un test ride:', testRideOrError);
        }
      } catch (error) {
        console.error('Erreur lors du traitement d\'un test ride:', error);
      }
    }

    return testRides;
  }

  async findAll(): Promise<TestRide[]> {
    const testRideModels = await TestRideModel.findAll();

    const testRides: TestRide[] = [];
    for (const model of testRideModels) {
      try {
        // Récupérer le nom de la concession
        const concessionModel = await ConcessionModel.findByPk(model.concessionId);
        const concessionName = concessionModel ? concessionModel.name : 'Concession non spécifiée';

        const testRideOrError = await TestRide.from(
          model.id,
          model.concessionId,
          model.motorcycleId,
          model.motorcycleName,
          model.firstName,
          model.lastName,
          model.email,
          model.phoneNumber,
          model.desiredDate,
          model.riderExperience,
          model.licenseType,
          model.licenseNumber,
          model.hasTrainingCertificate,
          model.preferredRideTime,
          model.additionalRequirements,
          model.message,
          model.status as TestRideStatus,
          model.createdAt,
          model.updatedAt,
          concessionName
        );

        if (!(testRideOrError instanceof Error)) {
          testRides.push(testRideOrError);
        } else {
          console.error('Erreur lors de la création d\'un test ride:', testRideOrError);
        }
      } catch (error) {
        console.error('Erreur lors du traitement d\'un test ride:', error);
      }
    }

    return testRides;
  }

  async update(testRide: TestRide): Promise<TestRide> {
    try {
      const [affectedCount] = await TestRideModel.update(
        {
          status: testRide.status,
          updatedAt: testRide.updatedAt,
          // Ajouter d'autres champs si nécessaire
        },
        {
          where: { id: testRide.id }
        }
      );

      if (affectedCount === 0) {
        console.error('Aucun test ride mis à jour:', testRide.id);
        throw new TestRideNotFoundError(testRide.id);
      }

      // Récupérer le test ride mis à jour
      const updatedTestRideModel = await TestRideModel.findByPk(testRide.id);
      
      if (!updatedTestRideModel) {
        console.error('Test ride introuvable après mise à jour:', testRide.id);
        throw new TestRideNotFoundError(testRide.id);
      }

      // Récupérer le nom de la concession
      const concessionModel = await ConcessionModel.findByPk(updatedTestRideModel.concessionId);
      const concessionName = concessionModel ? concessionModel.name : 'Concession non spécifiée';

      // Convertir le modèle mis à jour en entité de domaine
      const updatedTestRideOrError = await TestRide.from(
        updatedTestRideModel.id,
        updatedTestRideModel.concessionId,
        updatedTestRideModel.motorcycleId,
        updatedTestRideModel.motorcycleName,
        updatedTestRideModel.firstName,
        updatedTestRideModel.lastName,
        updatedTestRideModel.email,
        updatedTestRideModel.phoneNumber,
        updatedTestRideModel.desiredDate,
        updatedTestRideModel.riderExperience,
        updatedTestRideModel.licenseType,
        updatedTestRideModel.licenseNumber,
        updatedTestRideModel.hasTrainingCertificate,
        updatedTestRideModel.preferredRideTime,
        updatedTestRideModel.additionalRequirements,
        updatedTestRideModel.message,
        updatedTestRideModel.status as TestRideStatus,
        updatedTestRideModel.createdAt,
        updatedTestRideModel.updatedAt,
        concessionName
      );

      if (updatedTestRideOrError instanceof Error) {
        console.error('Erreur de validation lors de la mise à jour:', updatedTestRideOrError);
        throw updatedTestRideOrError;
      }

      return updatedTestRideOrError;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du test ride:', error);
      if (error instanceof TestRideNotFoundError) {
        throw error;
      }
      throw new Error('Erreur lors de la mise à jour du test ride');
    }
  }

  async delete(id: string): Promise<void> {
    const deletedCount = await TestRideModel.destroy({ where: { id } });
    
    if (deletedCount === 0) {
      throw new TestRideNotFoundError(id);
    }
  }

  async findDetailedTestRides(filters?: {
    concessionId?: string,
    status?: TestRideStatus,
    startDate?: Date,
    endDate?: Date
  }): Promise<{
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    motorcycleName: string,
    desiredDate: Date,
    status: TestRideStatus,
    riderExperience: RiderExperience,
    licenseType: LicenseType,
    concessionName: string
  }[]> {
    try {
      const whereCondition: any = {};

      if (filters?.concessionId) {
        whereCondition.concessionId = filters.concessionId;
      }

      if (filters?.status) {
        whereCondition.status = filters.status;
      }

      if (filters?.startDate && filters?.endDate) {
        whereCondition.desiredDate = {
          [Op.between]: [filters.startDate, filters.endDate]
        };
      }

      const testRides = await TestRideModel.findAll({
        where: whereCondition,
        attributes: [
          'id', 
          'firstName', 
          'lastName', 
          'email', 
          'phoneNumber', 
          'motorcycleName', 
          'desiredDate', 
          'status', 
          'riderExperience', 
          'licenseType',
          'concessionId'
        ],
        order: [['desiredDate', 'DESC']]
      });

      return testRides.map(ride => ({
        id: ride.id,
        firstName: ride.firstName,
        lastName: ride.lastName,
        email: ride.email,
        phoneNumber: ride.phoneNumber,
        motorcycleName: ride.motorcycleName || 'Moto non spécifiée',
        desiredDate: ride.desiredDate,
        status: ride.status,
        riderExperience: ride.riderExperience,
        licenseType: ride.licenseType,
        concessionName: 'Concession non spécifiée'
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche des test rides:', error);
      throw new Error('Impossible de récupérer les test rides');
    }
  }
}
