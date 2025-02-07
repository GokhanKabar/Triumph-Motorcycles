import { IMotorcycleRepository } from "../../domain/motorcycle/repositories/IMotorcycleRepository";
import Motorcycle from "../../domain/motorcycle/entities/Motorcycle";
import MotorcycleModel from "../frameworks/postgres/models/MotorcycleModel";
import { sequelize } from "../frameworks/postgres/config/database";

export class PostgreSQLMotorcycleRepository implements IMotorcycleRepository {
  private toMotorcycle(motorcycle: MotorcycleModel): Motorcycle {
    return Motorcycle.from(
      motorcycle.id,
      motorcycle.brand,
      motorcycle.model,
      motorcycle.year,
      motorcycle.vin,
      motorcycle.mileage,
      motorcycle.status,
      motorcycle.concessionId,
      motorcycle.createdAt,
      motorcycle.updatedAt
    ) as Motorcycle;
  }
  async findAll(): Promise<Motorcycle[]> {
    try {
      console.log("DEBUG: Récupération de toutes les motos");
      const motorcycles = await MotorcycleModel.findAll();
      return motorcycles.map(this.toMotorcycle.bind(this));
    } catch (error) {
      console.error("DEBUG: Erreur lors de la récupération des motos:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<Motorcycle | null> {
    try {
      console.log("DEBUG: Recherche de la moto avec ID:", id);
      const motorcycle = await MotorcycleModel.findByPk(id);
      if (!motorcycle) {
        console.log("DEBUG: Moto non trouvée");
        return null;
      }

      return this.toMotorcycle(motorcycle);
    } catch (error) {
      console.error("DEBUG: Erreur lors de la recherche de la moto:", error);
      throw error;
    }
  }

  async findByConcessionId(concessionId: string): Promise<Motorcycle[]> {
    try {
      console.log(
        "DEBUG: Recherche des motos pour la concession:",
        concessionId
      );
      const motorcycles = await MotorcycleModel.findAll({
        where: { concessionId },
      });

      return motorcycles.map(this.toMotorcycle.bind(this));
    } catch (error) {
      console.error("DEBUG: Erreur lors de la recherche des motos:", error);
      throw error;
    }
  }

  async save(motorcycle: Motorcycle): Promise<void> {
    try {
      console.log("DEBUG: Sauvegarde d'une nouvelle moto:", motorcycle);
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
      console.log("DEBUG: Moto sauvegardée avec succès");
    } catch (error) {
      console.error("DEBUG: Erreur lors de la sauvegarde de la moto:", error);
      throw error;
    }
  }

  async update(motorcycle: Motorcycle): Promise<void> {
    try {
      console.log("DEBUG: Mise à jour de la moto:", motorcycle);
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
      console.log("DEBUG: Moto mise à jour avec succès");
    } catch (error) {
      console.error("DEBUG: Erreur lors de la mise à jour de la moto:", error);
      throw error;
    }
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
