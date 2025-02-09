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
import motorcycleRoutes from "../../../interfaces/http/routes/motorcycleRoutes";
import maintenanceRoutes from "../../../interfaces/http/routes/maintenanceRoutes";
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
import MotorcycleModel from "../postgres/models/MotorcycleModel";
import InventoryPartModel from "../postgres/models/InventoryPartModel";
import CompanyMotorcycleModel from "../postgres/models/CompanyMotorcycleModel";
import inventoryPartRoutes from "../../../interfaces/http/routes/inventoryPartRoutes";
import { CreateInventoryPartUseCase } from "@application/inventory/use-cases/CreateInventoryPartUseCase";
import { PostgreSQLInventoryPartRepository } from "../../repositories/PostgreSQLInventoryPartRepository";
import driverRoutes from "../../../interfaces/http/routes/driverRoutes";
import companyMotorcycleRouter from "../../../interfaces/http/routes/companyMotorcycleRoutes";
import TestRideModel from "../postgres/models/TestRideModel";
import { testRideRoutes } from "../../../interfaces/http/routes/testRideRoutes";
import { PostgreSQLTestRideRepository } from "../../repositories/PostgreSQLTestRideRepository";
import PartOrderModel from "../postgres/models/PartOrderModel";
import { partOrderRoutes } from "../../../interfaces/http/routes/partOrderRoutes";
import { PostgreSQLPartOrderRepository } from "../../repositories/PostgreSQLPartOrderRepository";

// Charger les variables d'environnement
config();

const app = express();

// Création des services globaux
const tokenService = new JWTTokenService();
const passwordHashingService = new Argon2PasswordHashingService();

// Initialisation des repositories
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const inventoryPartRepository = new PostgreSQLInventoryPartRepository();
const testRideRepository = new PostgreSQLTestRideRepository();
const partOrderRepository = new PostgreSQLPartOrderRepository();

// Middlewares de sécurité et configuration
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration du middleware d'authentification
const getUserUseCase = new GetUserUseCase(userRepository);
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCase);
const createInventoryPartUseCase = new CreateInventoryPartUseCase(
  inventoryPartRepository
);

// Montage des routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Route standard
app.use("/api/companies", companyRoutes);
app.use("/api/company-motorcycles", companyMotorcycleRouter); // Routes pour l'association company-motorcycle
app.use("/api/concessions", concessionRoutes); // Route des concessions
app.use("/api/motorcycles", motorcycleRoutes); // Route des motos
app.use("/api/maintenances", maintenanceRoutes); // Route des maintenances
app.use("/api/inventory-parts", inventoryPartRoutes); // Route des pièces d'inventaire
app.use("/api/drivers", driverRoutes); // Route des conducteurs
app.use("/api/test-rides", testRideRoutes(testRideRepository)); // Route des réservations d'essai
app.use("/api/part-orders", partOrderRoutes(partOrderRepository)); // Route des commandes de pièces

// Gestion des routes 404
app.use((req: Request, res: Response, next: NextFunction) => {
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

    // 1. Initialiser les modèles de base
    await UserModel.initialize(sequelize);
    await CompanyModel.initialize(sequelize);

    // 2. Synchroniser pour créer les tables de base
    await sequelize.sync({ force: true });

    // 3. Initialiser les modèles avec dépendances
    await ConcessionModel.initialize(sequelize);
    await sequelize.sync({ force: false }); // Mise à jour incrémentale

    // 4. Initialiser les modèles qui dépendent des concessions
    await MotorcycleModel.initialize(sequelize);
    await sequelize.sync({ force: false }); // Mise à jour incrémentale

    // 5. Initialiser le modèle des pièces d'inventaire
    await InventoryPartModel.initialize(sequelize);
    await sequelize.sync({ force: false }); // Mise à jour incrémentale

    // 6. Initialiser le modèle CompanyMotorcycle
    await CompanyMotorcycleModel.initialize(sequelize);
    await sequelize.sync({ force: false }); // Mise à jour incrémentale

    // 7. Initialiser le modèle TestRide
    await TestRideModel.initialize(sequelize);
    await sequelize.sync({ force: false }); // Mise à jour incrémentale

    // 8. Initialiser le modèle PartOrder
    await PartOrderModel.initialize(sequelize);
    await sequelize.sync({ force: false }); // Mise à jour incrémentale

    // 9. Seed la base de données
    await seedDatabase(sequelize);

    console.log("✅ Base de données initialisée avec succès");
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
