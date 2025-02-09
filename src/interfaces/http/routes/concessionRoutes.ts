import express, { Request, Response } from "express";
import { ConcessionController } from "../controllers/ConcessionController";
import { JWTTokenService } from "../../../infrastructure/services/TokenService";
import { GetUserUseCase } from "../../../application/user/use-cases/GetUserUseCase";
import { PostgreSQLUserRepository } from "../../../infrastructure/repositories/PostgreSQLUserRepository";
import { Argon2PasswordHashingService } from "../../../infrastructure/services/Argon2PasswordHashingService";
import { UpdateConcessionUseCase } from "../../../application/concession/use-cases/UpdateConcessionUseCase";
import { PostgreSQLConcessionRepository } from "../../../infrastructure/repositories/PostgreSQLConcessionRepository";
import { ConcessionNotFoundError } from "../../../domain/concession/errors/ConcessionNotFoundError";
import { DeleteConcessionUseCase } from "../../../application/concession/use-cases/DeleteConcessionUseCase";
import { ConcessionHasMotorcyclesError } from "../../../domain/concession/errors/ConcessionHasMotorcyclesError";
import { DeleteConcessionResponseDTO } from "../../../application/dtos/ConcessionDTO";
import { CreateConcessionUseCase } from "../../../application/concession/use-cases/CreateConcessionUseCase";

const router = express.Router();
const concessionController = new ConcessionController();

// Services
const tokenService = new JWTTokenService();
const passwordHashingService = new Argon2PasswordHashingService();
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const concessionRepository = new PostgreSQLConcessionRepository();
const getUserUseCase = new GetUserUseCase(userRepository);
const updateConcessionUseCase = new UpdateConcessionUseCase(concessionRepository);
const deleteConcessionUseCase = new DeleteConcessionUseCase(concessionRepository);
const createConcessionUseCase = new CreateConcessionUseCase(concessionRepository);

// Route publique pour récupérer toutes les concessions
router.get("/", concessionController.getAllConcessions);

// Route publique pour récupérer une concession par son ID
router.get("/:id", concessionController.getConcessionById);

// POST /api/concessions - Créer une nouvelle concession
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, address, userId } = req.body;

    // Validation des données
    if (!name?.trim()) {
      return res.status(400).json({ 
        message: "Le nom de la concession est requis",
        error: {
          code: 'VALIDATION_ERROR',
          details: 'Le nom ne peut pas être vide'
        }
      });
    }

    if (!address?.trim()) {
      return res.status(400).json({ 
        message: "L'adresse de la concession est requise",
        error: {
          code: 'VALIDATION_ERROR',
          details: 'L\'adresse ne peut pas être vide'
        }
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        message: "L'ID utilisateur est requis",
        error: {
          code: 'VALIDATION_ERROR',
          details: 'Un ID utilisateur valide est nécessaire'
        }
      });
    }

    // Utiliser le cas d'utilisation pour créer la concession
    const result = await createConcessionUseCase.execute(
      name.trim(), 
      address.trim(), 
      userId
    );

    // Gérer les erreurs potentielles
    if (result instanceof Error) {
      return res.status(400).json({
        message: "Erreur lors de la création de la concession",
        error: {
          code: 'CREATION_ERROR',
          details: result.message
        }
      });
    }

    // Réponse de succès
    res.status(201).json({
      message: "Concession créée avec succès",
      concession: {
        id: result.id,
        name: result.name,
        address: result.address,
        userId: result.userId,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur interne lors de la création de la concession",
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }
    });
  }
});

// PUT /api/concessions/:id - Mettre à jour une concession
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    // Validation des données
    if (!name?.trim() || !address?.trim()) {
      return res.status(400).json({ 
        message: "Le nom et l'adresse sont requis pour la mise à jour" 
      });
    }

    // Récupérer la concession existante pour obtenir son userId
    const existingConcession = await concessionRepository.findById(id);
    if (!existingConcession) {
      return res.status(404).json({ message: "Concession non trouvée" });
    }

    // Mettre à jour la concession en gardant le userId existant
    const result = await updateConcessionUseCase.execute(
      id,
      name.trim(),
      address.trim(),
      existingConcession.userId
    );

    if (result instanceof Error) {
      return res.status(400).json({ message: result.message });
    }

    return res.json(result);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la mise à jour de la concession",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// DELETE /api/concessions/:id - Supprimer une concession
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier d'abord si la concession existe
    const existingConcession = await concessionRepository.findById(id);
    if (!existingConcession) {
      return res.status(404).json({
        success: false,
        message: "Concession non trouvée",
        error: {
          code: 'CONCESSION_NOT_FOUND',
          details: `La concession avec l'ID ${id} n'existe pas`
        }
      });
    }

    // Tenter de supprimer la concession
    const result = await deleteConcessionUseCase.execute(id);

    if (result instanceof ConcessionHasMotorcyclesError) {
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer la concession car elle possède encore des motos",
        error: {
          code: 'CONCESSION_HAS_MOTORCYCLES',
          details: "Veuillez d'abord supprimer ou réaffecter toutes les motos de cette concession"
        }
      });
    }

    if (result instanceof Error) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: result.message
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Concession supprimée avec succès"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la concession",
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }
    });
  }
});

export default router;
