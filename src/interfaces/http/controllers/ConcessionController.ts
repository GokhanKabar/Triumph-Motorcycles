import { Request, Response } from "express";
import { PostgreSQLConcessionRepository } from "../../../infrastructure/repositories/PostgreSQLConcessionRepository";
import Concession from "../../../domain/concession/entities/Concession";
import { ConcessionHasMotorcyclesError } from "../../../domain/errors/ConcessionHasMotorcyclesError";
import {
  CreateConcessionDTO,
  UpdateConcessionDTO,
} from "../../../application/dtos/ConcessionDTO";
import { v4 as uuidv4 } from 'uuid';

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
      console.log('DEBUG: Création concession - Request body COMPLET:', JSON.stringify(req.body, null, 2));
      console.log('DEBUG: Création concession - Utilisateur authentifié:', req.user);

      const concessionData: CreateConcessionDTO = req.body;
      
      // Validation complète des données d'entrée
      const validationErrors: string[] = [];

      // Validation du nom
      if (!concessionData.name || concessionData.name.trim() === '') {
        validationErrors.push("Le nom de la concession est obligatoire");
      }

      // Validation de l'ID utilisateur
      if (!concessionData.userId) {
        validationErrors.push("L'ID utilisateur est requis");
      }

      // Vérification de la longueur des champs
      if (concessionData.name && concessionData.name.trim().length > 100) {
        validationErrors.push("Le nom de la concession est trop long (max 100 caractères)");
      }

      if (concessionData.address && concessionData.address.trim().length > 255) {
        validationErrors.push("L'adresse est trop longue (max 255 caractères)");
      }

      // Gestion des erreurs de validation
      if (validationErrors.length > 0) {
        console.log('DEBUG: Erreurs de validation:', validationErrors);
        res.status(400).json({ 
          error: {
            code: 'VALIDATION_ERROR',
            message: "Erreurs de validation",
            details: validationErrors
          }
        });
        return;
      }

      console.log('DEBUG: Création concession - Données validées:', {
        userId: concessionData.userId,
        name: concessionData.name,
        address: concessionData.address
      });

      let concession;
      try {
        concession = Concession.from(
          undefined, // Forcer la génération d'un nouvel ID
          concessionData.userId,
          concessionData.name.trim(),
          concessionData.address ? concessionData.address.trim() : "N/A"
        );
      } catch (entityCreationError) {
        console.error('DEBUG: Erreur lors de la création de l\'entité:', entityCreationError);
        res.status(400).json({ 
          error: {
            code: 'ENTITY_CREATION_ERROR',
            message: entityCreationError instanceof Error ? entityCreationError.message : 'Erreur inconnue',
            details: entityCreationError
          }
        });
        return;
      }

      console.log('DEBUG: Création concession - Entité créée:', JSON.stringify(concession, null, 2));

      if (concession instanceof Error) {
        console.log('DEBUG: Erreur lors de la création de l\'entité:', concession);
        res.status(400).json({ 
          error: {
            code: 'ENTITY_CREATION_ERROR',
            message: concession.message
          }
        });
        return;
      }

      try {
        await this.concessionRepository.save(concession);
        console.log('DEBUG: Concession sauvegardée avec succès');
        
        res.status(201).json({
          message: "Concession créée avec succès",
          concession: {
            id: concession.id,
            userId: concession.userId,
            name: concession.name,
            address: concession.address
          }
        });
      } catch (saveError) {
        console.error('DEBUG: Erreur lors de la sauvegarde de la concession:', saveError);
        
        // Log détaillé de l'erreur
        if (saveError instanceof Error) {
          console.error('Détails de l\'erreur:', {
            name: saveError.name,
            message: saveError.message,
            stack: saveError.stack
          });
        }

        res.status(500).json({ 
          error: {
            code: 'SAVE_ERROR',
            message: "Impossible de sauvegarder la concession",
            details: saveError instanceof Error ? {
              message: saveError.message,
              name: saveError.name,
              stack: saveError.stack
            } : String(saveError)
          }
        });
      }
    } catch (error) {
      console.error("Erreur complète lors de la création de la concession:", error);
      
      // Log détaillé de l'erreur
      if (error instanceof Error) {
        console.error('Détails de l\'erreur:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }

      res.status(500).json({ 
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: "Erreur lors de la création de la concession",
          details: error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          } : String(error)
        }
      });
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
          const motorcycleCount = await this.concessionRepository.countMotorcycles(req.params.id);
          res.status(400).json({
            error: {
              code: 'CONCESSION_HAS_MOTORCYCLES',
              message: `Impossible de supprimer la concession car elle possède ${motorcycleCount} motos.`,
              details: {
                motorcycleCount: motorcycleCount
              }
            }
          });
          return;
        }
        if (deleteError instanceof Error) {
          console.error('DEBUG: Erreur lors de la suppression:', deleteError.message);
          if (deleteError.message.includes("not found")) {
            res.status(404).json({ 
              error: {
                code: 'NOT_FOUND',
                message: "Concession non trouvée"
              }
            });
          } else {
            res.status(500).json({
              error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: "Erreur lors de la suppression de la concession"
              }
            });
          }
        } else {
          res.status(500).json({
            error: {
              code: 'UNKNOWN_ERROR',
              message: "Une erreur inconnue est survenue"
            }
          });
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
