import { IConcessionRepository } from "../../domain/concession/repositories/IConcessionRepository";
import Concession from "../../domain/concession/entities/Concession";
import ConcessionModel from "../frameworks/postgres/models/ConcessionModel";
import MotorcycleModel from "../frameworks/postgres/models/MotorcycleModel";
import { MissingRequiredFieldError } from "../../domain/errors/MissingRequiredFieldError";
import { ConcessionNotFoundError } from "../../domain/errors/ConcessionNotFoundError";
import { ConcessionHasMotorcyclesError } from "../../domain/errors/ConcessionHasMotorcyclesError";

export class PostgreSQLConcessionRepository implements IConcessionRepository {
  async findAll(): Promise<Concession[]> {
    const concessionModels = await ConcessionModel.findAll();

    return concessionModels.map((model) => {
      const concession = Concession.from(
        model.id,
        model.userId,
        model.name,
        model.address,
        model.createdAt,
        model.updatedAt
      );

      if (concession instanceof MissingRequiredFieldError) {
        throw new Error("Corrupted concession data in database");
      }

      return concession;
    });
  }

  async save(concession: Concession): Promise<void> {
    await ConcessionModel.create({
      id: concession.id,
      userId: concession.userId,
      name: concession.name,
      address: concession.address,
      createdAt: concession.createdAt,
      updatedAt: concession.updatedAt,
    });
  }

  async findById(id: string): Promise<Concession | null> {
    const model = await ConcessionModel.findByPk(id);

    if (!model) {
      return null;
    }

    const concession = Concession.from(
      model.id,
      model.userId,
      model.name,
      model.address,
      model.createdAt,
      model.updatedAt
    );

    if (concession instanceof MissingRequiredFieldError) {
      throw new Error("Corrupted concession data in database");
    }

    return concession;
  }

  async findByUserId(userId: string): Promise<Concession[]> {
    const concessionModels = await ConcessionModel.findAll({
      where: { userId },
    });

    return concessionModels.map((model) => {
      const concession = Concession.from(
        model.id,
        model.userId,
        model.name,
        model.address,
        model.createdAt,
        model.updatedAt
      );

      if (concession instanceof MissingRequiredFieldError) {
        throw new Error("Corrupted concession data in database");
      }

      return concession;
    });
  }

  async update(concession: Concession): Promise<void> {
    const result = await ConcessionModel.update(
      {
        name: concession.name,
        address: concession.address,
        updatedAt: concession.updatedAt,
      },
      {
        where: { id: concession.id },
      }
    );

    if (result[0] === 0) {
      throw new ConcessionNotFoundError();
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Vérifier si la concession existe
      const concession = await this.findById(id);
      if (!concession) {
        throw new ConcessionNotFoundError();
      }

      // Vérifier s'il y a des motos associées
      const motorcycleCount = await MotorcycleModel.count({
        where: { concessionId: id },
      });

      if (motorcycleCount > 0) {
        throw new ConcessionHasMotorcyclesError();
      }

      // Si pas de motos associées, supprimer la concession
      await ConcessionModel.destroy({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  async countMotorcycles(concessionId: string): Promise<number> {
    return await MotorcycleModel.count({
      where: { concessionId },
    });
  }
}
