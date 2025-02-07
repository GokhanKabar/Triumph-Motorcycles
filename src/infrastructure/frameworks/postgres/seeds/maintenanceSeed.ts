import { v4 as uuidv4 } from 'uuid';
import { Sequelize } from 'sequelize';
import MaintenanceModel from '../models/MaintenanceModel';
import { MaintenanceType, MaintenanceStatus } from '../../../../domain/maintenance/entities/Maintenance';
import MotorcycleModel from '../models/MotorcycleModel';

export class MaintenanceSeed {
  static async seed(force: boolean = false, sequelize?: Sequelize): Promise<void> {
    try {
      // Validate input
      if (!sequelize) {
        throw new Error('Sequelize instance is required');
      }

      // Ensure MotorcycleModel is initialized
      if (!MotorcycleModel.isInitialized) {
        try {
          MotorcycleModel.initialize(sequelize);
          await MotorcycleModel.sync({ force: false });
        } catch (initError) {
          console.error('Failed to initialize MotorcycleModel:', initError);
          throw new Error(`MotorcycleModel initialization failed: ${initError.message}`);
        }
      }

      // Ensure MaintenanceModel is initialized
      if (!MaintenanceModel.isInitialized) {
        try {
          MaintenanceModel.initialize(sequelize);
          await MaintenanceModel.sync({ force: force });
        } catch (initError) {
          console.error('Failed to initialize MaintenanceModel:', initError);
          throw new Error(`MaintenanceModel initialization failed: ${initError.message}`);
        }
      }

      // Count existing records
      const maintenanceCount = await MaintenanceModel.count();
      
      if (maintenanceCount === 0 || force) {
        // Find motorcycles
        const motorcycles = await MotorcycleModel.findAll({ 
          limit: 1,
          raw: true  // Ensure plain object
        });
        
        if (motorcycles.length === 0) {
          console.warn('No motorcycles found. Cannot seed maintenance records.');
          return;
        }

        // Utiliser un kilométrage par défaut si non disponible
        const currentMileage = motorcycles[0].currentMileage || 5000;

        const maintenanceData = [
          {
            id: uuidv4(),
            motorcycleId: motorcycles[0].id,
            type: MaintenanceType.PREVENTIVE,
            status: MaintenanceStatus.SCHEDULED,
            scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
            mileageAtMaintenance: currentMileage + 1000, // Prochaine maintenance
            technicianNotes: 'Révision périodique standard',
            replacedParts: ['Filtre à huile', 'Filtre à air'],
            totalCost: 250.50,
            nextMaintenanceRecommendation: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Dans 6 mois
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: uuidv4(),
            motorcycleId: motorcycles[0].id,
            type: MaintenanceType.CURATIVE,
            status: MaintenanceStatus.IN_PROGRESS,
            scheduledDate: new Date(),
            actualDate: new Date(),
            mileageAtMaintenance: currentMileage,
            technicianNotes: 'Réparation de frein arrière suite à usure anormale',
            replacedParts: ['Plaquettes de frein', 'Disque de frein arrière'],
            totalCost: 450.75,
            nextMaintenanceRecommendation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Dans 3 mois
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        // Bulk create with validation
        const createdMaintenances = await MaintenanceModel.bulkCreate(maintenanceData, {
          validate: true,
          returning: true
        });

        console.log(`✅ Seeded ${createdMaintenances.length} maintenance records.`);
      } else {
        console.log(`📊 Maintenance table already contains ${maintenanceCount} records.`);
      }
    } catch (error) {
      console.error('❌ Maintenance seeding error:', error);
      throw error;
    }
  }
}
