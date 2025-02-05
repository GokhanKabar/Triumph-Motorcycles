import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { sequelize } from "../postgres/config/database";
import userRoutes from "../../../interfaces/http/routes/userRoutes";
import { authRoutes } from "../../../interfaces/http/routes/authRoutes";
import companyRoutes from "../../../interfaces/http/routes/companyRoutes";
import concessionRoutes from "../../../interfaces/http/routes/concessionRoutes";
import { errorHandler } from "../../../interfaces/http/middlewares/errorHandler";
import { JWTTokenService } from "../../services/TokenService";
import { AuthMiddleware } from "../../../interfaces/http/middlewares/authMiddleware";
import { GetUserUseCase } from "../../../application/user/use-cases/GetUserUseCase";
import { PostgreSQLUserRepository } from "../../repositories/PostgreSQLUserRepository";
import { Argon2PasswordHashingService } from "../../services/Argon2PasswordHashingService";
import { seedDatabase } from "../postgres/script/seed-database";
import UserModel from "../postgres/models/UserModel";
import CompanyModel from "../postgres/models/CompanyModel";
import ConcessionModel from "../postgres/models/ConcessionModel";

// Charger les variables d'environnement
config();

const app = express();

// Création des services globaux
const tokenService = new JWTTokenService();
const passwordHashingService = new Argon2PasswordHashingService();

// Initialisation des repositories
const userRepository = new PostgreSQLUserRepository(passwordHashingService);

// Middlewares de sécurité et configuration
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration du middleware d'authentification
const getUserUseCase = new GetUserUseCase(userRepository);
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCase);

// Montage des routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Route standard
app.use("/api/companies", companyRoutes);
app.use("/api/concessions", concessionRoutes); // Route des entreprises

// Gestion des routes 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Middleware de gestion des erreurs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

async function initializeDatabase() {
  try {
    if (!sequelize) {
      throw new Error("Database connection not established");
    }

    await UserModel.initialize(sequelize);
    await CompanyModel.initialize(sequelize);
    await ConcessionModel.initialize(sequelize);
    await sequelize.sync({ force: false });
    await seedDatabase(sequelize);
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 3001;
initializeDatabase().then(() => {
  // Démarrer le serveur
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
});

export default app;
