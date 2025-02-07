import express from "express";
import { CompanyMotorcycleController } from "../controllers/CompanyMotorcycleController";
import { PostgreSQLCompanyMotorcycleRepository } from "../../../infrastructure/repositories/PostgreSQLCompanyMotorcycleRepository";
import { PostgreSQLCompanyRepository } from "../../../infrastructure/repositories/PostgreSQLCompanyRepository";
import { PostgreSQLMotorcycleRepository } from "../../../infrastructure/repositories/PostgreSQLMotorcycleRepository";
import { AssignMotorcycleToCompanyUseCase } from "../../../application/companyMotorcycle/use-cases/AssignMotorcycleToCompanyUseCase";
import { RemoveMotorcycleFromCompanyUseCase } from "../../../application/companyMotorcycle/use-cases/RemoveMotorcycleFromCompanyUseCase";
import { GetCompanyMotorcyclesUseCase } from "../../../application/companyMotorcycle/use-cases/GetCompanyMotorcyclesUseCase";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { JWTTokenService } from "../../../infrastructure/services/TokenService";
import { GetUserUseCase } from "../../../application/user/use-cases/GetUserUseCase";
import { PostgreSQLUserRepository } from "../../../infrastructure/repositories/PostgreSQLUserRepository";
import { Argon2PasswordHashingService } from "../../../infrastructure/services/Argon2PasswordHashingService";

const router = express.Router();

// Création des instances pour l'authentification
const passwordHashingService = new Argon2PasswordHashingService();
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const tokenService = new JWTTokenService();
const getUserUseCaseForAuth = new GetUserUseCase(userRepository);
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCaseForAuth);

// Initialisation des repositories
const companyMotorcycleRepository = new PostgreSQLCompanyMotorcycleRepository();
const companyRepository = new PostgreSQLCompanyRepository();
const motorcycleRepository = new PostgreSQLMotorcycleRepository();

// Initialisation des use cases
const assignMotorcycleToCompanyUseCase = new AssignMotorcycleToCompanyUseCase(
  companyRepository,
  motorcycleRepository,
  companyMotorcycleRepository
);

const removeMotorcycleFromCompanyUseCase =
  new RemoveMotorcycleFromCompanyUseCase(companyMotorcycleRepository);

const getCompanyMotorcyclesUseCase = new GetCompanyMotorcyclesUseCase(
  companyRepository,
  motorcycleRepository,
  companyMotorcycleRepository
);

// Initialisation du contrôleur
const companyMotorcycleController = new CompanyMotorcycleController(
  assignMotorcycleToCompanyUseCase,
  removeMotorcycleFromCompanyUseCase,
  getCompanyMotorcyclesUseCase
);

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware.authenticate.bind(authMiddleware));

// Routes
router.post(
  "/companies/:companyId/motorcycles",
  companyMotorcycleController.assignMotorcycle.bind(companyMotorcycleController)
);

router.delete(
  "/companies/:companyId/motorcycles/:motorcycleId",
  companyMotorcycleController.removeMotorcycle.bind(companyMotorcycleController)
);

router.get(
  "/companies/:companyId/motorcycles",
  companyMotorcycleController.getCompanyMotorcycles.bind(
    companyMotorcycleController
  )
);

export default router;
