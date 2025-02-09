import { Request, Response } from "express";
import { PostgreSQLCompanyRepository } from "../../../infrastructure/repositories/PostgreSQLCompanyRepository";
import Company from "../../../domain/company/entities/Company";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
} from "../../../application/dtos/CompanyDTO";
import CompanyMotorcycleModel from "../../../infrastructure/frameworks/postgres/models/CompanyMotorcycleModel";

export class CompanyController {
  private companyRepository: PostgreSQLCompanyRepository;

  constructor() {
    this.companyRepository = new PostgreSQLCompanyRepository();
  }

  getAllCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
      const companies = await this.companyRepository.findAll();
      res.json(companies);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des entreprises" });
    }
  };

  getCompanyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const company = await this.companyRepository.findById(req.params.id);
      if (!company) {
        res.status(404).json({ message: "Entreprise non trouvée" });
        return;
      }
      res.json(company);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération de l'entreprise" });
    }
  };

  createCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyData: CreateCompanyDTO = req.body;
      
      // Vérifier que l'utilisateur est connecté
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const company = Company.from(
        undefined,
        req.user.id,
        companyData.name,
        companyData.address
      );

      if (company instanceof Error) {
        res.status(400).json({ message: company.message });
        return;
      }

      await this.companyRepository.save(company);
      
      res.status(201).json(company);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la création de l'entreprise" });
    }
  };

  updateCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyData: UpdateCompanyDTO = req.body;
      const existingCompany = await this.companyRepository.findById(req.params.id);

      if (!existingCompany) {
        res.status(404).json({ message: "Entreprise non trouvée" });
        return;
      }

      // Créer une nouvelle instance avec les champs mis à jour
      const updatedCompany = Company.from(
        existingCompany.id,
        existingCompany.userId,
        companyData.name || existingCompany.name,
        companyData.address || existingCompany.address,
        existingCompany.createdAt,
        new Date()
      );

      if (updatedCompany instanceof Error) {
        res.status(400).json({ message: updatedCompany.message });
        return;
      }
      await this.companyRepository.update(updatedCompany);
      res.json(updatedCompany);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de l'entreprise" });
    }
  };

  deleteCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      // Vérifier d'abord si l'entreprise existe
      const existingCompany = await this.companyRepository.findById(req.params.id);
      if (!existingCompany) {
        res.status(404).json({ message: "Entreprise non trouvée" });
        return;
      }

      try {
        await this.companyRepository.delete(req.params.id);
        res.json({ message: "Entreprise supprimée avec succès" });
      } catch (deleteError: any) {
        if (deleteError.name === 'CompanyHasMotorcyclesError') {
          const motorcycles = await this.companyRepository.getCompanyMotorcycles(req.params.id);
          res.status(400).json({
            message: "Impossible de supprimer l'entreprise car elle possède des motos.",
            details: "Veuillez d'abord retirer toutes les motos associées à cette entreprise.",
            motorcycleCount: motorcycles.length
          });
          return;
        }
        if (deleteError.message.includes("not found")) {
          res.status(404).json({ message: "Entreprise non trouvée" });
          return;
        }
        throw deleteError;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'CompanyHasMotorcyclesError') {
        const motorcycles = await this.companyRepository.getCompanyMotorcycles(req.params.id);
        res.status(400).json({
          message: "Impossible de supprimer l'entreprise car elle possède des motos.",
          details: "Veuillez d'abord retirer toutes les motos associées à cette entreprise.",
          motorcycleCount: motorcycles.length
        });
        return;
      }
      res.status(500).json({ 
        message: "Une erreur inattendue est survenue lors de la suppression de l'entreprise" 
      });
    }
  };
}
