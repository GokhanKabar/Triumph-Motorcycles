import { Request, Response } from "express";
import { PostgreSQLConcessionRepository } from "../../../infrastructure/repositories/PostgreSQLConcessionRepository";
import Concession from "../../../domain/concession/entities/Concession";
import { ConcessionHasMotorcyclesError } from "../../../domain/concession/errors/ConcessionHasMotorcyclesError";
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
      const concession = await this.concessionRepository.findById(
        req.params.id
      );
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
      const concessionData: CreateConcessionDTO = req.body;

      // Validation complète des données d'entrée
      const validationErrors: string[] = [];

      // Validation du nom
      if (!concessionData.name || concessionData.name.trim() === "") {
        validationErrors.push("Le nom de la concession est obligatoire");
      }

      // Validation de l'ID utilisateur
      if (!concessionData.userId) {
        validationErrors.push("L'ID utilisateur est requis");
      }

      // Vérification de la longueur des champs
      if (concessionData.name && concessionData.name.trim().length > 100) {
        validationErrors.push(
          "Le nom de la concession est trop long (max 100 caractères)"
        );
      }

      if (
        concessionData.address &&
        concessionData.address.trim().length > 255
      ) {
        validationErrors.push("L'adresse est trop longue (max 255 caractères)");
      }

      // Gestion des erreurs de validation
      if (validationErrors.length > 0) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Erreurs de validation",
            details: validationErrors,
          },
        });
        return;
      }

      let concession;
      try {
        concession = Concession.from(
          undefined,
          concessionData.userId,
          concessionData.name.trim(),
          concessionData.address ? concessionData.address.trim() : "N/A"
        );
      } catch (entityCreationError) {
        res.status(400).json({
          error: {
            code: "ENTITY_CREATION_ERROR",
            message:
              entityCreationError instanceof Error
                ? entityCreationError.message
                : "Erreur inconnue",
            details: entityCreationError,
          },
        });
        return;
      }

      if (concession instanceof Error) {
        res.status(400).json({
          error: {
            code: "ENTITY_CREATION_ERROR",
            message: concession.message,
          },
        });
        return;
      }

      try {
        await this.concessionRepository.save(concession);
        res.status(201).json({
          message: "Concession créée avec succès",
          concession: {
            id: concession.id,
            userId: concession.userId,
            name: concession.name,
            address: concession.address,
          },
        });
      } catch (saveError) {
        res.status(500).json({
          error: {
            code: "SAVE_ERROR",
            message: "Impossible de sauvegarder la concession",
            details:
              saveError instanceof Error
                ? {
                    message: saveError.message,
                    name: saveError.name,
                    stack: saveError.stack,
                  }
                : String(saveError),
          },
        });
      }
    } catch (error) {
      res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la création de la concession",
          details:
            error instanceof Error
              ? {
                  message: error.message,
                  name: error.name,
                  stack: error.stack,
                }
              : String(error),
        },
      });
    }
  };

  updateConcession = async (req: Request, res: Response): Promise<void> => {
    try {
      const concessionData: UpdateConcessionDTO = req.body;
      const existingConcession = await this.concessionRepository.findById(
        req.params.id
      );

      if (!existingConcession) {
        res.status(404).json({ message: "Concession non trouvée" });
        return;
      }

      const updatedConcession = Concession.from(
        existingConcession.id,
        existingConcession.userId,
        concessionData.name || existingConcession.name,
        concessionData.address || existingConcession.address,
        existingConcession.createdAt,
        new Date()
      );

      if (updatedConcession instanceof Error) {
        res.status(400).json({ message: updatedConcession.message });
        return;
      }
      await this.concessionRepository.update(updatedConcession);
      res.json(updatedConcession);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de la concession" });
    }
  };

  deleteConcession = async (req: Request, res: Response): Promise<void> => {
    try {
      const existingConcession = await this.concessionRepository.findById(
        req.params.id
      );
      if (!existingConcession) {
        res.status(404).json({ message: "Concession non trouvée" });
        return;
      }

      try {
        await this.concessionRepository.delete(req.params.id);
        res.json({ message: "Concession supprimée avec succès" });
      } catch (deleteError) {
        if (deleteError instanceof ConcessionHasMotorcyclesError) {
          const motorcycleCount =
            await this.concessionRepository.countMotorcycles(req.params.id);
          res.status(400).json({
            error: {
              code: "CONCESSION_HAS_MOTORCYCLES",
              message: `Impossible de supprimer la concession car elle possède ${motorcycleCount} motos.`,
              details: {
                motorcycleCount: motorcycleCount,
              },
            },
          });
          return;
        }
        if (deleteError instanceof Error) {
          if (deleteError.message.includes("not found")) {
            res.status(404).json({
              error: {
                code: "NOT_FOUND",
                message: "Concession non trouvée",
              },
            });
          } else {
            res.status(500).json({
              error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Erreur lors de la suppression de la concession",
              },
            });
          }
        } else {
          res.status(500).json({
            error: {
              code: "UNKNOWN_ERROR",
              message: "Une erreur inconnue est survenue",
            },
          });
        }
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de la concession" });
    }
  };
}
