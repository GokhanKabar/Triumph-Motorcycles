import express from "express";
import { ConcessionController } from "../controllers/ConcessionController";
import { JWTTokenService } from "../../../infrastructure/services/TokenService";
import { GetUserUseCase } from "../../../application/user/use-cases/GetUserUseCase";
import { PostgreSQLUserRepository } from "../../../infrastructure/repositories/PostgreSQLUserRepository";
import { Argon2PasswordHashingService } from "../../../infrastructure/services/Argon2PasswordHashingService";

const router = express.Router();
const concessionController = new ConcessionController();

// Création des services et use cases nécessaires pour l'authentification
const tokenService = new JWTTokenService();
const passwordHashingService = new Argon2PasswordHashingService();
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const getUserUseCase = new GetUserUseCase(userRepository);

// Route publique pour récupérer toutes les concessions
router.get("/", concessionController.getAllConcessions);

// Route publique pour récupérer une concession par son ID
router.get("/:id", concessionController.getConcessionById);

// POST /api/concessions - Créer une nouvelle concession
router.post("/", async (req: Request, res: Response) => {
  try {
    const newConcession = await ConcessionModel.create(req.body);
    res.status(201).json(newConcession);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la concession" });
  }
});

// PUT /api/concessions/:id - Mettre à jour une concession
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const [updated] = await ConcessionModel.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated) {
      const updatedConcession = await ConcessionModel.findByPk(req.params.id);
      return res.json(updatedConcession);
    }

    return res.status(404).json({ message: "Concession non trouvée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la concession" });
  }
});

// DELETE /api/concessions/:id - Supprimer une concession
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await ConcessionModel.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      return res.status(204).send();
    }

    return res.status(404).json({ message: "Concession non trouvée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la concession" });
  }
});

export default router;
