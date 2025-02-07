import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import DriverModel from '../models/DriverModel';
import MotorcycleModel from '../models/MotorcycleModel';
import { LicenseType, DriverStatus } from '../../../../domain/driver/entities/Driver';

export class DriverSeed {
  static async seed(sequelize: Sequelize, force: boolean = false): Promise<void> {
    try {
      // Vérifier si le modèle est initialisé
      if (!DriverModel.isInitialized) {
        DriverModel.initialize(sequelize);
      }

      // Synchroniser le modèle
      await DriverModel.sync({ force });

      // Vérifier s'il y a déjà des drivers
      const existingDriversCount = await DriverModel.count();
      if (existingDriversCount > 0 && !force) {
        console.log('Des drivers existent déjà. Seed ignoré.');
        return;
      }

      // Récupérer des motos existantes pour les associations
      const motorcycles = await MotorcycleModel.findAll({
        limit: 5,
        attributes: ['id']
      });
      const motorcycleIds = motorcycles.map(m => m.get('id') as string);

      // Données des drivers
      const driversData = [
        {
          id: uuidv4(),
          firstName: 'Jean',
          lastName: 'Dupont',
          licenseNumber: 'A12345',
          licenseType: LicenseType.A,
          licenseExpirationDate: new Date('2026-12-31'),
          status: DriverStatus.ACTIVE,
          currentMotorcycleId: motorcycleIds.length > 0 ? motorcycleIds[0] : null,
          drivingExperience: 5
        },
        {
          id: uuidv4(),
          firstName: 'Marie',
          lastName: 'Dubois',
          licenseNumber: 'B67890',
          licenseType: LicenseType.A2,
          licenseExpirationDate: new Date('2025-06-30'),
          status: DriverStatus.ACTIVE,
          currentMotorcycleId: motorcycleIds.length > 1 ? motorcycleIds[1] : null,
          drivingExperience: 2
        },
        {
          id: uuidv4(),
          firstName: 'Pierre',
          lastName: 'Martin',
          licenseNumber: 'C54321',
          licenseType: LicenseType.A1,
          licenseExpirationDate: new Date('2024-09-15'),
          status: DriverStatus.INACTIVE,
          currentMotorcycleId: null,
          drivingExperience: 1
        }
      ];

      // Créer les drivers
      await DriverModel.bulkCreate(driversData, {
        ignoreDuplicates: true
      });

      console.log('Seed des drivers terminée');
    } catch (error) {
      console.error('Erreur lors du seed des drivers :', error);
      throw error;
    }
  }
}
