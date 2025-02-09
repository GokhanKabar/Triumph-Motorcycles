import { IMotorcycleRepository } from "../../domain/motorcycle/repositories/IMotorcycleRepository";
import Motorcycle from "../../domain/motorcycle/entities/Motorcycle";
import MotorcycleModel from "../frameworks/postgres/models/MotorcycleModel";
import MaintenanceModel from "../frameworks/postgres/models/MaintenanceModel";
import { sequelize } from "../frameworks/postgres/config/database";
import { MotorcycleStatus } from "../../domain/motorcycle/enums/MotorcycleStatus";

export class PostgreSQLMotorcycleRepository implements IMotorcycleRepository {
  private toMotorcycle(motorcycle: MotorcycleModel): Motorcycle {
    // Forcer le statut par défaut si undefined ou null
    const safeStatus = motorcycle.status || MotorcycleStatus.AVAILABLE;
    // Validation supplémentaire du statut
    if (!Object.values(MotorcycleStatus).includes(safeStatus)) {
      safeStatus = MotorcycleStatus.AVAILABLE;
    }

    return new Motorcycle(
      motorcycle.id,
      motorcycle.brand,
      motorcycle.model,
      motorcycle.year,
      motorcycle.vin,
      motorcycle.mileage,
      safeStatus,
      motorcycle.concessionId,
      motorcycle.createdAt,
      motorcycle.updatedAt
    );
  }
  async findAll(): Promise<Motorcycle[]> {
    try {
      const motorcycles = await MotorcycleModel.findAll();
      return motorcycles.map(this.toMotorcycle.bind(this));
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<Motorcycle | null> {
    try {
      const motorcycle = await MotorcycleModel.findByPk(id);
      if (!motorcycle) {
        return null;
      }
      return this.toMotorcycle(motorcycle);
    } catch (error) {
      throw error;
    }
  }

  async findByConcessionId(concessionId: string): Promise<Motorcycle[]> {
    try {
      const motorcycles = await MotorcycleModel.findAll({
        where: { concessionId },
      });

      return motorcycles.map(this.toMotorcycle.bind(this));
    } catch (error) {
      throw error;
    }
  }

  async save(motorcycle: Motorcycle): Promise<void> {
    try {
      await MotorcycleModel.create({
        id: motorcycle.id,
        brand: motorcycle.brand,
        model: motorcycle.model,
        year: motorcycle.year,
        vin: motorcycle.vin,
        mileage: motorcycle.mileage,
        status: motorcycle.status,
        concessionId: motorcycle.concessionId,
        createdAt: motorcycle.createdAt,
        updatedAt: motorcycle.updatedAt,
      });
    } catch (error) {
      throw error;
    }
  }

  async update(motorcycle: Motorcycle): Promise<void> {
    try {
      await MotorcycleModel.update(
        {
          brand: motorcycle.brand,
          model: motorcycle.model,
          year: motorcycle.year,
          vin: motorcycle.vin,
          color: motorcycle.color,
          mileage: motorcycle.mileage,
          status: motorcycle.status,
          concessionId: motorcycle.concessionId,
          updatedAt: motorcycle.updatedAt,
        },
        {
          where: { id: motorcycle.id },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const transaction = await sequelize.transaction();
    
    try {
      // Vérifier si la moto a des maintenances
      const maintenances = await MaintenanceModel.findAll({
        where: { motorcycleId: id }
      });

      if (maintenances.length > 0) {
        throw new Error('Impossible de supprimer cette moto car elle a des maintenances associées');
      }

      // Si pas de maintenances, supprimer la moto
      await MotorcycleModel.destroy({
        where: { id },
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async count(): Promise<number> {
    return await MotorcycleModel.count();
  }
}
