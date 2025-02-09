import { ICompanyRepository } from "../../domain/company/repositories/ICompanyRepository";
import Company from "../../domain/company/entities/Company";
import CompanyModel from "../frameworks/postgres/models/CompanyModel";
import CompanyMotorcycleModel from "../frameworks/postgres/models/CompanyMotorcycleModel";
import { MissingRequiredFieldError } from "../../domain/errors/MissingRequiredFieldError";
import { CompanyNotFoundError } from "../../domain/errors/CompanyNotFoundError";

export class PostgreSQLCompanyRepository implements ICompanyRepository {
  async findAll(): Promise<Company[]> {
    const companyModels = await CompanyModel.findAll();

    return companyModels.map((model) => {
      const company = Company.from(
        model.id,
        model.userId,
        model.name,
        model.address,
        model.createdAt,
        model.updatedAt
      );

      if (company instanceof MissingRequiredFieldError) {
        throw new Error("Corrupted company data in database");
      }

      return company;
    });
  }
  async save(company: Company): Promise<void> {
    await CompanyModel.create({
      id: company.id,
      userId: company.userId,
      name: company.name,
      address: company.address,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    });
  }

  async findById(id: string): Promise<Company | null> {
    const companyModel = await CompanyModel.findByPk(id);
    if (!companyModel) return null;

    const company = Company.from(
      companyModel.id,
      companyModel.userId,
      companyModel.name,
      companyModel.address,
      companyModel.createdAt,
      companyModel.updatedAt
    );

    if (company instanceof MissingRequiredFieldError) {
      throw new Error("Corrupted company data in database");
    }

    return company;
  }

  async findByUserId(userId: string): Promise<Company[]> {
    const companyModels = await CompanyModel.findAll({
      where: { userId },
    });

    return companyModels.map((model) => {
      const company = Company.from(
        model.id,
        model.userId,
        model.name,
        model.address,
        model.createdAt,
        model.updatedAt
      );

      if (company instanceof MissingRequiredFieldError) {
        throw new Error("Corrupted company data in database");
      }

      return company;
    });
  }

  async update(company: Company): Promise<void> {
    const result = await CompanyModel.update(
      {
        name: company.name,
        address: company.address,
        updatedAt: company.updatedAt,
      },
      {
        where: { id: company.id },
      }
    );

    if (result[0] === 0) {
      throw new CompanyNotFoundError();
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Vérifier d'abord si l'entreprise existe
      const company = await this.findById(id);
      if (!company) {
        throw new CompanyNotFoundError();
      }

      // Vérifier si l'entreprise a des motos associées
      const motorcycles = await this.getCompanyMotorcycles(id);
      if (motorcycles.length > 0) {
        const error = new Error('COMPANY_HAS_MOTORCYCLES');
        error.name = 'CompanyHasMotorcyclesError';
        throw error;
      }

      await CompanyModel.destroy({
        where: { id },
      });
      
    } catch (error: any) {
      
      if (error.name === 'CompanyNotFoundError') {
        throw error;
      }
      
      // Si c'est une erreur de clé étrangère de Sequelize ou notre erreur personnalisée
      if (error.name === 'SequelizeForeignKeyConstraintError' || 
          error.name === 'CompanyHasMotorcyclesError') {
        const customError = new Error('COMPANY_HAS_MOTORCYCLES');
        customError.name = 'CompanyHasMotorcyclesError';
        throw customError;
      }
      
      // Pour toute autre erreur
      throw new Error('Une erreur est survenue lors de la suppression de l\'entreprise');
    }
  }

  async getCompanyMotorcycles(companyId: string): Promise<any[]> {
    try {
      // Vérifier directement dans la table CompanyMotorcycle
      const motorcycles = await CompanyMotorcycleModel.findAll({
        where: { companyId }
      });
      return motorcycles;
    } catch (error) {
      return [];
    }
  }
}
