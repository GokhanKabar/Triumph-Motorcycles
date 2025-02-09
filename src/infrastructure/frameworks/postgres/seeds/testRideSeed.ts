import { v4 as uuidv4 } from 'uuid';
import TestRideModel from '../models/TestRideModel';
import ConcessionModel from '../models/ConcessionModel';
import MotorcycleModel from '../models/MotorcycleModel';
import { TestRideStatus, RiderExperience, LicenseType } from '../../../../domain/testRide/entities/TestRide';
import { MotorcycleStatus } from '../../../../domain/motorcycle/enums/MotorcycleStatus';

export class TestRideSeed {
  static async seed(force: boolean = false) {
    try {
      if (!force) {
        const existingTestRides = await TestRideModel.findAll();
        if (existingTestRides.length > 0) {
          console.log('🏁 Test rides already exist. Skipping seed.');
          return;
        }
      }

      // Récupérer toutes les concessions
      const concessions = await ConcessionModel.findAll();

      const testRides = [];

      for (const concession of concessions) {
        // Trouver les motos disponibles pour cette concession
        const availableMotorcycles = await MotorcycleModel.findAll({
          where: {
            concessionId: concession.id,
            status: MotorcycleStatus.AVAILABLE
          }
        });

        if (availableMotorcycles.length === 0) {
          console.warn(`⚠️ Aucune moto disponible pour la concession ${concession.get('name')}`);
          continue;
        }

        // Sélectionner une moto aléatoire parmi les motos disponibles
        const motorcycle = availableMotorcycles[Math.floor(Math.random() * availableMotorcycles.length)];

        // Créer un test ride pour cette concession et moto
        const testRide = {
          id: uuidv4(),
          concessionId: concession.id,
          motorcycleId: motorcycle.id,
          motorcycleName: `${motorcycle.get('brand')} ${motorcycle.get('model')}`,
          firstName: `Client ${concession.get('name')}`,
          lastName: 'Test',
          email: `client.${concession.get('name').toLowerCase().replace(/\s+/g, '')}@example.com`,
          phoneNumber: '+33612345678',
          desiredDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Date dans les 30 prochains jours
          status: TestRideStatus.PENDING,
          riderExperience: RiderExperience.BEGINNER,
          licenseType: LicenseType.A2,
          licenseNumber: `LIC${Math.floor(Math.random() * 10000)}`,
          hasTrainingCertificate: Math.random() > 0.5,
          preferredRideTime: ['MORNING', 'AFTERNOON', 'EVENING'][Math.floor(Math.random() * 3)],
          additionalRequirements: 'Aucune exigence particulière',
          message: `Intéressé par un essai de la moto de la concession ${concession.get('name')}`
        };

        testRides.push(testRide);
      }

      if (testRides.length > 0) {
        await TestRideModel.bulkCreate(testRides);
        console.log(`✅ ${testRides.length} test rides seeded successfully`);
      } else {
        console.warn('❗ Aucun test ride n\'a pu être créé');
      }
    } catch (error) {
      console.error('❌ Erreur lors du seed des test rides:', error);
      throw error;
    }
  }
}
