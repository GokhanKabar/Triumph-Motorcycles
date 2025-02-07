import { Sequelize } from 'sequelize';
import InventoryPartModel from '../models/InventoryPartModel';
import { PartCategory } from '@domain/inventory/entities/InventoryPart';
import { v4 as uuidv4 } from 'uuid';

export class InventoryPartSeed {
  static async seed(force: boolean = false, sequelize?: Sequelize): Promise<void> {
    try {
      // Check if we need to seed
      if (!force) {
        const existingCount = await InventoryPartModel.count();
        if (existingCount > 0) {
          console.log(`🛠️ Inventory Parts already seeded (${existingCount} parts). Skipping...`);
          return;
        }
      }

      const inventoryParts = [
        // Brake System Parts
        {
          id: uuidv4(),
          name: 'Plaquettes de frein avant',
          category: PartCategory.BRAKE_SYSTEM,
          referenceNumber: 'T2300101',
          currentStock: 50,
          minStockThreshold: 10,
          unitPrice: 89.99,
          motorcycleModels: ['Tiger 900', 'Speed Triple']
        },
        {
          id: uuidv4(),
          name: 'Disque de frein arrière',
          category: PartCategory.BRAKE_SYSTEM,
          referenceNumber: 'T2300102',
          currentStock: 30,
          minStockThreshold: 5,
          unitPrice: 129.50,
          motorcycleModels: ['Rocket 3', 'Tiger 1200']
        },
        
        // Engine Parts
        {
          id: uuidv4(),
          name: 'Filtre à huile',
          category: PartCategory.OIL_FILTER,
          referenceNumber: 'T2300201',
          currentStock: 75,
          minStockThreshold: 15,
          unitPrice: 24.99,
          motorcycleModels: ['Street Triple', 'Bonneville T120']
        },
        {
          id: uuidv4(),
          name: 'Bougie d\'allumage',
          category: PartCategory.SPARK_PLUG,
          referenceNumber: 'T2300202',
          currentStock: 100,
          minStockThreshold: 20,
          unitPrice: 19.50,
          motorcycleModels: ['Tiger 900', 'Speed Triple', 'Rocket 3']
        },
        
        // Suspension Parts
        {
          id: uuidv4(),
          name: 'Amortisseur arrière',
          category: PartCategory.OTHER,
          referenceNumber: 'T2300301',
          currentStock: 25,
          minStockThreshold: 5,
          unitPrice: 349.99,
          motorcycleModels: ['Tiger 1200', 'Speed Triple']
        },
        {
          id: uuidv4(),
          name: 'Ressort de fourche',
          category: PartCategory.OTHER,
          referenceNumber: 'T2300302',
          currentStock: 40,
          minStockThreshold: 8,
          unitPrice: 129.50,
          motorcycleModels: ['Street Triple', 'Bonneville T120']
        },
        
        // Electrical Parts
        {
          id: uuidv4(),
          name: 'Batterie',
          category: PartCategory.OTHER,
          referenceNumber: 'T2300401',
          currentStock: 60,
          minStockThreshold: 10,
          unitPrice: 159.99,
          motorcycleModels: ['Tiger 900', 'Rocket 3', 'Speed Triple']
        },
        {
          id: uuidv4(),
          name: 'Régulateur de tension',
          category: PartCategory.OTHER,
          referenceNumber: 'T2300402',
          currentStock: 35,
          minStockThreshold: 5,
          unitPrice: 89.50,
          motorcycleModels: ['Tiger 1200', 'Bonneville T120']
        },
        
        // Exhaust Parts
        {
          id: uuidv4(),
          name: 'Silencieux d\'échappement',
          category: PartCategory.OTHER,
          referenceNumber: 'T2300501',
          currentStock: 20,
          minStockThreshold: 3,
          unitPrice: 599.99,
          motorcycleModels: ['Speed Triple', 'Street Triple']
        },
        {
          id: uuidv4(),
          name: 'Collecteur d\'échappement',
          category: PartCategory.OTHER,
          referenceNumber: 'T2300502',
          currentStock: 15,
          minStockThreshold: 2,
          unitPrice: 349.50,
          motorcycleModels: ['Rocket 3', 'Tiger 1200']
        }
      ];

      // Bulk create inventory parts
      await InventoryPartModel.bulkCreate(inventoryParts);
      
      console.log('✅ Inventory Parts seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding Inventory Parts:', error);
      throw error;
    }
  }
}
