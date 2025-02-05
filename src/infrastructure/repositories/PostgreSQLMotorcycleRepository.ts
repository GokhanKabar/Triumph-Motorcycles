import { IMotorcycleRepository } from "../../domain/motorcycle/repositories/IMotorcycleRepository";
import Motorcycle from "../../domain/motorcycle/entities/Motorcycle";
import MotorcycleModel from "../frameworks/postgres/models/MotorcycleModel";
import { sequelize } from "../frameworks/postgres/config/database";

export class PostgreSQLMotorcycleRepository implements IMotorcycleRepository {
  async findAll(): Promise<Motorcycle[]> {
    const motorcycles = await MotorcycleModel.findAll();
    return motorcycles.map((motorcycle) =>
      Motorcycle.from(
        motorcycle.id,
        motorcycle.brand,
        motorcycle.model,
        motorcycle.vin,
        motorcycle.currentMileage,
        motorcycle.concessionId,
        motorcycle.createdAt,
        motorcycle.updatedAt
      )
    ) as Motorcycle[];
  }

  async findById(id: string): Promise<Motorcycle | null> {
    const motorcycle = await MotorcycleModel.findByPk(id);
    if (!motorcycle) {
      return null;
    }

    return Motorcycle.from(
      motorcycle.id,
      motorcycle.brand,
      motorcycle.model,
      motorcycle.vin,
      motorcycle.currentMileage,
      motorcycle.concessionId,
      motorcycle.createdAt,
      motorcycle.updatedAt
    ) as Motorcycle;
  }

  async findByConcessionId(concessionId: string): Promise<Motorcycle[]> {
    const motorcycles = await MotorcycleModel.findAll({
      where: { concessionId },
    });

    return motorcycles.map((motorcycle) =>
      Motorcycle.from(
        motorcycle.id,
        motorcycle.brand,
        motorcycle.model,
        motorcycle.vin,
        motorcycle.currentMileage,
        motorcycle.concessionId,
        motorcycle.createdAt,
        motorcycle.updatedAt
      )
    ) as Motorcycle[];
  }

  async save(motorcycle: Motorcycle): Promise<void> {
    await MotorcycleModel.create({
      id: motorcycle.id,
      brand: motorcycle.brand,
      model: motorcycle.model,
      vin: motorcycle.vin,
      currentMileage: motorcycle.currentMileage,
      concessionId: motorcycle.concessionId,
      createdAt: motorcycle.createdAt,
      updatedAt: motorcycle.updatedAt,
    });
  }

  async update(motorcycle: Motorcycle): Promise<void> {
    await MotorcycleModel.update(
      {
        brand: motorcycle.brand,
        model: motorcycle.model,
        vin: motorcycle.vin,
        currentMileage: motorcycle.currentMileage,
        concessionId: motorcycle.concessionId,
        updatedAt: motorcycle.updatedAt,
      },
      {
        where: { id: motorcycle.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await MotorcycleModel.destroy({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await MotorcycleModel.count();
  }
}
