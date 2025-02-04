import express from "express";
import { CompanyController } from "../controllers/CompanyController";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { validateCompanyMiddleware } from "../middlewares/validateCompanyMiddleware";
import { JWTTokenService } from "../../../infrastructure/services/TokenService";
import { GetUserUseCase } from "../../../application/user/use-cases/GetUserUseCase";
import { PostgreSQLUserRepository } from "../../../infrastructure/repositories/PostgreSQLUserRepository";
import { Argon2PasswordHashingService } from "../../../infrastructure/services/Argon2PasswordHashingService";

const router = express.Router();
const companyController = new CompanyController();

// Création des services et use cases nécessaires pour l'authentification
const tokenService = new JWTTokenService();
const passwordHashingService = new Argon2PasswordHashingService();
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const getUserUseCase = new GetUserUseCase(userRepository);

// Création du middleware d'authentification
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCase);

// Routes protégées par authentification
router.use(authMiddleware.authenticate);

// GET /api/companies - Récupérer toutes les entreprises
router.get("/", companyController.getAllCompanies);

// GET /api/companies/:id - Récupérer une entreprise par son ID
router.get("/:id", companyController.getCompanyById);

// POST /api/companies - Créer une nouvelle entreprise
router.post("/", validateCompanyMiddleware, companyController.createCompany);

// PUT /api/companies/:id - Mettre à jour une entreprise
router.put("/:id", validateCompanyMiddleware, companyController.updateCompany);

// DELETE /api/companies/:id - Supprimer une entreprise
router.delete("/:id", companyController.deleteCompany);

export default router;
