import { Request, Response } from "express";
import { PostgreSQLCompanyRepository } from "../../../infrastructure/repositories/PostgreSQLCompanyRepository";
import Company from "../../../domain/company/entities/Company";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
} from "../../../application/dtos/CompanyDTO";

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
      console.log('DEBUG: Création entreprise - Request body:', req.body);
      console.log('DEBUG: Création entreprise - User:', req.user);

      const companyData: CreateCompanyDTO = req.body;
      
      // Vérifier que l'utilisateur est connecté
      if (!req.user || !req.user.id) {
        console.log('DEBUG: Utilisateur non authentifié');
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      console.log('DEBUG: Création entreprise - Données validées:', {
        userId: req.user.id,
        name: companyData.name,
        address: companyData.address
      });

      const company = Company.from(
        undefined, // id sera généré automatiquement
        req.user.id, // userId de l'utilisateur connecté
        companyData.name,
        companyData.address
      );

      console.log('DEBUG: Création entreprise - Entité créée:', company);

      if (company instanceof Error) {
        console.log('DEBUG: Erreur lors de la création de l\'entité:', company);
        res.status(400).json({ message: company.message });
        return;
      }

      await this.companyRepository.save(company);
      console.log('DEBUG: Entreprise sauvegardée avec succès');
      
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la création de l'entreprise" });
    }
  };

  updateCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('DEBUG: Mise à jour entreprise - Request body:', req.body);
      console.log('DEBUG: Mise à jour entreprise - Params:', req.params);

      const companyData: UpdateCompanyDTO = req.body;
      const existingCompany = await this.companyRepository.findById(req.params.id);

      if (!existingCompany) {
        console.log('DEBUG: Entreprise non trouvée');
        res.status(404).json({ message: "Entreprise non trouvée" });
        return;
      }

      console.log('DEBUG: Entreprise existante:', existingCompany);

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
        console.log('DEBUG: Erreur lors de la mise à jour:', updatedCompany);
        res.status(400).json({ message: updatedCompany.message });
        return;
      }

      console.log('DEBUG: Nouvelle instance créée:', updatedCompany);

      await this.companyRepository.update(updatedCompany);
      console.log('DEBUG: Entreprise mise à jour avec succès');

      res.json(updatedCompany);
    } catch (error) {
      console.error("Error updating company:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de l'entreprise" });
    }
  };

  deleteCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('DEBUG: Suppression entreprise - ID:', req.params.id);

      // Vérifier d'abord si l'entreprise existe
      const existingCompany = await this.companyRepository.findById(req.params.id);
      if (!existingCompany) {
        console.log('DEBUG: Entreprise non trouvée');
        res.status(404).json({ message: "Entreprise non trouvée" });
        return;
      }

      console.log('DEBUG: Entreprise trouvée, suppression en cours...');

      try {
        await this.companyRepository.delete(req.params.id);
        console.log('DEBUG: Entreprise supprimée avec succès');
        res.json({ message: "Entreprise supprimée avec succès" });
      } catch (deleteError) {
        if (deleteError instanceof Error) {
          console.error('DEBUG: Erreur lors de la suppression:', deleteError.message);
          if (deleteError.message.includes("not found")) {
            res.status(404).json({ message: "Entreprise non trouvée" });
          } else {
            throw deleteError; // Relancer l'erreur pour le catch externe
          }
        } else {
          throw deleteError;
        }
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'entreprise" });
    }
  };
}
