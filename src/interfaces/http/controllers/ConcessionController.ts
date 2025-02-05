import { Request, Response } from "express";
import { PostgreSQLConcessionRepository } from "../../../infrastructure/repositories/PostgreSQLConcessionRepository";
import Concession from "../../../domain/concession/entities/Concession";
import { ConcessionHasMotorcyclesError } from "../../../domain/errors/ConcessionHasMotorcyclesError";
import {
  CreateConcessionDTO,
  UpdateConcessionDTO,
} from "../../../application/dtos/ConcessionDTO";

export class ConcessionController {
  private concessionRepository: PostgreSQLConcessionRepository;

  constructor() {
    this.concessionRepository = new PostgreSQLConcessionRepository();
  }

  getAllConcessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const concessions = await this.concessionRepository.findAll();
      res.json(concessions);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des concessions" });
    }
  };

  getConcessionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const concession = await this.concessionRepository.findById(req.params.id);
      if (!concession) {
        res.status(404).json({ message: "Concession non trouvée" });
        return;
      }
      res.json(concession);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération de la concession" });
    }
  };

  createConcession = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('DEBUG: Création concession - Request body:', req.body);
      console.log('DEBUG: Création concession - User:', req.user);

      const concessionData: CreateConcessionDTO = req.body;
      
      if (!req.user || !req.user.id) {
        console.log('DEBUG: Utilisateur non authentifié');
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      console.log('DEBUG: Création concession - Données validées:', {
        userId: req.user.id,
        name: concessionData.name,
        address: concessionData.address
      });

      const concession = Concession.from(
        undefined,
        req.user.id,
        concessionData.name,
        concessionData.address
      );

      console.log('DEBUG: Création concession - Entité créée:', concession);

      if (concession instanceof Error) {
        console.log('DEBUG: Erreur lors de la création de l\'entité:', concession);
        res.status(400).json({ message: concession.message });
        return;
      }

      await this.concessionRepository.save(concession);
      console.log('DEBUG: Concession sauvegardée avec succès');
      
      res.status(201).json(concession);
    } catch (error) {
      console.error("Error creating concession:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la création de la concession" });
    }
  };

  updateConcession = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('DEBUG: Mise à jour concession - Request body:', req.body);
      console.log('DEBUG: Mise à jour concession - Params:', req.params);

      const concessionData: UpdateConcessionDTO = req.body;
      const existingConcession = await this.concessionRepository.findById(req.params.id);

      if (!existingConcession) {
        console.log('DEBUG: Concession non trouvée');
        res.status(404).json({ message: "Concession non trouvée" });
        return;
      }

      console.log('DEBUG: Concession existante:', existingConcession);

      const updatedConcession = Concession.from(
        existingConcession.id,
        existingConcession.userId,
        concessionData.name || existingConcession.name,
        concessionData.address || existingConcession.address,
        existingConcession.createdAt,
        new Date()
      );

      if (updatedConcession instanceof Error) {
        console.log('DEBUG: Erreur lors de la mise à jour:', updatedConcession);
        res.status(400).json({ message: updatedConcession.message });
        return;
      }

      console.log('DEBUG: Nouvelle instance créée:', updatedConcession);

      await this.concessionRepository.update(updatedConcession);
      console.log('DEBUG: Concession mise à jour avec succès');

      res.json(updatedConcession);
    } catch (error) {
      console.error("Error updating concession:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de la concession" });
    }
  };

  deleteConcession = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('DEBUG: Suppression concession - ID:', req.params.id);

      const existingConcession = await this.concessionRepository.findById(req.params.id);
      if (!existingConcession) {
        console.log('DEBUG: Concession non trouvée');
        res.status(404).json({ message: "Concession non trouvée" });
        return;
      }

      console.log('DEBUG: Concession trouvée, suppression en cours...');

      try {
        await this.concessionRepository.delete(req.params.id);
        console.log('DEBUG: Concession supprimée avec succès');
        res.json({ message: "Concession supprimée avec succès" });
      } catch (deleteError) {
        if (deleteError instanceof ConcessionHasMotorcyclesError) {
          console.error('DEBUG: Impossible de supprimer la concession:', deleteError.message);
          res.status(400).json({ message: deleteError.message });
          return;
        }
        if (deleteError instanceof Error) {
          console.error('DEBUG: Erreur lors de la suppression:', deleteError.message);
          if (deleteError.message.includes("not found")) {
            res.status(404).json({ message: "Concession non trouvée" });
          } else {
            throw deleteError;
          }
        } else {
          throw deleteError;
        }
      }
    } catch (error) {
      console.error("Error deleting concession:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de la concession" });
    }
  };
}
