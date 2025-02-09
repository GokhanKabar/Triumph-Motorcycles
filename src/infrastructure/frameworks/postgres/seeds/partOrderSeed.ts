import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import PartOrderModel from '../models/PartOrderModel';
import { OrderStatus } from '../../../../domain/partOrder/entities/PartOrder';

export class PartOrderSeed {
    static async seed(force: boolean = false, sequelize?: Sequelize): Promise<void> {
        try {
            // Vérifier si les données sont déjà présentes
            if (!force) {
                const existingCount = await PartOrderModel.count();
                if (existingCount > 0) {
                    console.log(`🛠️ Part Orders already seeded (${existingCount} orders). Skipping...`);
                    return;
                }
            }

            // Création des commandes de pièces
            const partOrders = [
                {
                    id: uuidv4(),
                    inventoryPartId: uuidv4(),
                    inventoryPartName: 'Plaquettes de frein avant',
                    supplier: 'Fournisseur A',
                    quantity: 10,
                    orderDate: new Date(),
                    expectedDeliveryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    status: OrderStatus.PENDING,
                    totalCost: 899.90,
                    orderReference: 'ORD12345',
                },
                {
                    id: uuidv4(),
                    inventoryPartId: uuidv4(),
                    inventoryPartName: 'Disque de frein arrière',
                    supplier: 'Fournisseur B',
                    quantity: 5,
                    orderDate: new Date(),
                    expectedDeliveryDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
                    status: OrderStatus.CONFIRMED,
                    totalCost: 647.50,
                    orderReference: 'ORD12346',
                },
                {
                    id: uuidv4(),
                    inventoryPartId: uuidv4(),
                    inventoryPartName: 'Filtre à huile',
                    supplier: 'Fournisseur C',
                    quantity: 50,
                    orderDate: new Date(),
                    expectedDeliveryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    status: OrderStatus.IN_PROGRESS,
                    totalCost: 1249.50,
                    orderReference: 'ORD12347',
                },
                {
                    id: uuidv4(),
                    inventoryPartId: uuidv4(),
                    inventoryPartName: 'Bougie d\'allumage',
                    supplier: 'Fournisseur D',
                    quantity: 100,
                    orderDate: new Date(),
                    expectedDeliveryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    status: OrderStatus.DELIVERED,
                    totalCost: 1950.00,
                    orderReference: 'ORD12348',
                },
                {
                    id: uuidv4(),
                    inventoryPartId: uuidv4(),
                    inventoryPartName: 'Amortisseur arrière',
                    supplier: 'Fournisseur E',
                    quantity: 3,
                    orderDate: new Date(),
                    expectedDeliveryDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
                    status: OrderStatus.CANCELLED,
                    totalCost: 1049.97,
                    orderReference: 'ORD12349',
                },
            ];

            // Bulk create des commandes de pièces
            await PartOrderModel.bulkCreate(partOrders);

            console.log('✅ Part Orders seeded successfully');
        } catch (error) {
            console.error('❌ Error seeding Part Orders:', error);
            throw error;
        }
    }
}
