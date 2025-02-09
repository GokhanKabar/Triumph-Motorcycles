import { Sequelize, DataTypes } from "sequelize";
import { seedDatabase } from "../script/seed-database";
import UserModel from "../models/UserModel";
import MaintenanceModel from "../models/MaintenanceModel";
import InventoryPartModel from "../models/InventoryPartModel";
import DriverModel from "../models/DriverModel";
import MotorcycleModel from "../models/MotorcycleModel";
import CompanyModel from "../models/CompanyModel";
import CompanyMotorcycleModel from "../models/CompanyMotorcycleModel";
import ConcessionModel from "../models/ConcessionModel";
import TestRideModel from "../models/TestRideModel";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "db",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "triumph_db",
  username: process.env.DB_USER || "triumph",
  password: process.env.DB_PASSWORD || "triumph123",
  logging: false,
});

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection to the database established successfully.");

    console.log("Starting model initialization...");

    try {
      console.log("Initializing models and associations...");

      // Initialize base models first
      UserModel.initialize(sequelize);

      // Initialize Company and its associations
      CompanyModel.initialize(sequelize);
      CompanyModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

      // Initialize Motorcycle
      MotorcycleModel.initialize(sequelize);

      // Initialize Concession
      ConcessionModel.initialize(sequelize);
      ConcessionModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

      // Initialize TestRide
      TestRideModel.initialize(sequelize);
      TestRideModel.belongsTo(ConcessionModel, { 
        foreignKey: 'concessionId', 
        as: 'concession' 
      });
      ConcessionModel.hasMany(TestRideModel, { 
        foreignKey: 'concessionId', 
        as: 'testRides' 
      });

      // Initialize CompanyMotorcycle and its associations
      console.log('Initializing CompanyMotorcycleModel...');
      try {
        CompanyMotorcycleModel.initialize(sequelize);
        console.log('CompanyMotorcycleModel initialized successfully');

        console.log('Setting up CompanyMotorcycle associations...');
        CompanyModel.hasMany(CompanyMotorcycleModel, {
          foreignKey: "companyId",
          as: "companyMotorcycles",
        });

        // Synchroniser tous les modèles avec la base de données
        console.log('Synchronizing all models with database...');
        await sequelize.sync({ force: true });
        console.log('Database synchronization complete');
        CompanyMotorcycleModel.belongsTo(CompanyModel, {
          foreignKey: "companyId",
          as: "company",
        });
        MotorcycleModel.hasMany(CompanyMotorcycleModel, {
          foreignKey: "motorcycleId",
          as: "companyMotorcycles",
        });
        CompanyMotorcycleModel.belongsTo(MotorcycleModel, {
          foreignKey: "motorcycleId",
          as: "motorcycle",
        });
        console.log('CompanyMotorcycle associations set up successfully');
      } catch (error) {
        console.error('Error initializing CompanyMotorcycleModel:', error);
        throw error;
      }

      // Initialize remaining models
      MaintenanceModel.initialize(sequelize);
      InventoryPartModel.initialize(sequelize);
      DriverModel.initialize(sequelize);

      console.log("All models and associations initialized successfully");
    } catch (error) {
      console.error("Error during model initialization:", error);
      throw error;
    }

    // Verify table creation
    console.log("Starting database synchronization...");
    await sequelize.sync({ force: true });
    console.log("✅ Models synchronized successfully.");
    
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log("Available tables:", tables);

    // Seed database in development
    if (process.env.NODE_ENV === "development") {
      await seedDatabase(sequelize);
    }
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

export { sequelize, initializeDatabase };
