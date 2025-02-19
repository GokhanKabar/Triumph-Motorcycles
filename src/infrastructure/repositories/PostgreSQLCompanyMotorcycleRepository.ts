import { ICompanyMotorcycleRepository } from "../../domain/companyMotorcycle/repositories/ICompanyMotorcycleRepository";
import { CompanyMotorcycle } from "../../domain/companyMotorcycle/entities/CompanyMotorcycle";
import CompanyMotorcycleModel from "../frameworks/postgres/models/CompanyMotorcycleModel";
import MotorcycleModel from "../frameworks/postgres/models/MotorcycleModel";
import { CompanyMotorcycleNotFoundError } from "../../domain/companyMotorcycle/errors/CompanyMotorcycleNotFoundError";

export class PostgreSQLCompanyMotorcycleRepository
  implements ICompanyMotorcycleRepository
{
  async save(companyMotorcycle: CompanyMotorcycle): Promise<void> {
    try {
      const result = await CompanyMotorcycleModel.create({
        id: companyMotorcycle.id,
        companyId: companyMotorcycle.companyId,
        motorcycleId: companyMotorcycle.motorcycleId,
        createdAt: companyMotorcycle.createdAt,
        updatedAt: companyMotorcycle.updatedAt,
      });

    } catch (error) {
      throw error;
    }
  }

  async findByCompanyId(companyId: string): Promise<CompanyMotorcycle[]> {
    try {
      // Check if model is initialized
      if (!CompanyMotorcycleModel.getInitializationStatus()) {
        return [];
      }

      const models = await CompanyMotorcycleModel.findAll({
        where: { companyId },
        include: [
          {
            model: MotorcycleModel,
            as: "motorcycle",
            required: true,
            attributes: ["id", "brand", "model", "year"],
          },
        ],
      });
      const entities = models.map((model) => this.toEntity(model));
      return entities;
    } catch (error) {
      throw error;
    }
  }

  async findByMotorcycleId(motorcycleId: string): Promise<CompanyMotorcycle[]> {
    const models = await CompanyMotorcycleModel.findAll({
      where: { motorcycleId },
    });

    return models.map((model) => this.toEntity(model));
  }

  async findByCompanyAndMotorcycleId(
    companyId: string,
    motorcycleId: string
  ): Promise<CompanyMotorcycle | null> {
    const model = await CompanyMotorcycleModel.findOne({
      where: { companyId, motorcycleId },
    });

    if (!model) {
      return null;
    }

    return this.toEntity(model);
  }

  async delete(companyMotorcycle: CompanyMotorcycle): Promise<void> {
    const result = await CompanyMotorcycleModel.destroy({
      where: { id: companyMotorcycle.id },
    });

    if (result === 0) {
      throw new CompanyMotorcycleNotFoundError(
        companyMotorcycle.companyId,
        companyMotorcycle.motorcycleId
      );
    }
  }

  private toEntity(model: any): CompanyMotorcycle {
    const motorcycle = model.motorcycle
      ? {
          id: model.motorcycle.id,
          brand: model.motorcycle.brand,
          model: model.motorcycle.model,
          year: model.motorcycle.year,
        }
      : null;

    return CompanyMotorcycle.create({
      id: model.id,
      motorcycle,
      companyId: model.companyId,
      motorcycleId: model.motorcycleId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
