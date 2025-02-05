import express from "express";
import { ConcessionController } from "../controllers/ConcessionController";
import { AuthMiddleware } from "../middlewares/authMiddleware";
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

// Création du middleware d'authentification
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCase);

// Routes protégées par authentification
router.use(authMiddleware.authenticate);

// GET /api/concessions - Récupérer toutes les concessions
router.get("/", concessionController.getAllConcessions);

// GET /api/concessions/:id - Récupérer une concession par son ID
router.get("/:id", concessionController.getConcessionById);

// POST /api/concessions - Créer une nouvelle concession
router.post("/", concessionController.createConcession);

// PUT /api/concessions/:id - Mettre à jour une concession
router.put("/:id", concessionController.updateConcession);

// DELETE /api/concessions/:id - Supprimer une concession
router.delete("/:id", concessionController.deleteConcession);

export default router;
