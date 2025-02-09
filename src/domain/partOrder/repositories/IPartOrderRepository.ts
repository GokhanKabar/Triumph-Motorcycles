import PartOrder from '../entities/PartOrder';
export interface IPartOrderRepository {
    findAll(): Promise<PartOrder[]>;
    create(partOrder: PartOrder): Promise<PartOrder>;
    findById(id: string): Promise<PartOrder | null>;
    findByConcessionId(concessionId: string): Promise<PartOrder[]>;
    findByInventoryPartId(inventoryPartId: string): Promise<PartOrder[]>;
    update(partOrder: PartOrder): Promise<PartOrder>;
    delete(id: string): Promise<void>;
}