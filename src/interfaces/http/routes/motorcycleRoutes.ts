import express from "express";
import { Request, Response } from "express";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { JWTTokenService } from "../../../infrastructure/services/TokenService";
import { GetUserUseCase } from "../../../application/user/use-cases/GetUserUseCase";
import { PostgreSQLUserRepository } from "../../../infrastructure/repositories/PostgreSQLUserRepository";
import { Argon2PasswordHashingService } from "../../../infrastructure/services/Argon2PasswordHashingService";
import MotorcycleModel from "../../../infrastructure/frameworks/postgres/models/MotorcycleModel";

const router = express.Router();

// Création des services et use cases nécessaires pour l'authentification
const tokenService = new JWTTokenService();
const passwordHashingService = new Argon2PasswordHashingService();
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const getUserUseCase = new GetUserUseCase(userRepository);

// Création du middleware d'authentification
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCase);

// Routes protégées par authentification
router.use(authMiddleware.authenticate);

// GET /api/motorcycles - Récupérer toutes les motos
router.get("/", async (req: Request, res: Response) => {
  try {
    const motorcycles = await MotorcycleModel.findAll();
    res.json(motorcycles);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des motos" });
  }
});

// GET /api/motorcycles/:id - Récupérer une moto par son ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const motorcycle = await MotorcycleModel.findByPk(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ message: "Moto non trouvée" });
    }
    res.json(motorcycle);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la moto" });
  }
});

// POST /api/motorcycles - Créer une nouvelle moto
router.post("/", async (req: Request, res: Response) => {
  try {
    const motorcycle = await MotorcycleModel.create(req.body);
    res.status(201).json(motorcycle);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la moto" });
  }
});

// PUT /api/motorcycles/:id - Mettre à jour une moto
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const motorcycle = await MotorcycleModel.findByPk(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ message: "Moto non trouvée" });
    }
    await motorcycle.update(req.body);
    res.json(motorcycle);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la moto" });
  }
});

// DELETE /api/motorcycles/:id - Supprimer une moto
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const motorcycle = await MotorcycleModel.findByPk(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ message: "Moto non trouvée" });
    }
    await motorcycle.destroy();
    res.json({ message: "Moto supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la moto:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Erreur lors de la suppression de la moto" 
    });
  }
});

export default router;
