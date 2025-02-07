import { Sequelize } from "sequelize";
import { seedDatabase } from "../script/seed-database";
import UserModel from "../models/UserModel";
import MaintenanceModel from "../models/MaintenanceModel";
import InventoryPartModel from "../models/InventoryPartModel";
import DriverModel from "../models/DriverModel";
import MotorcycleModel from "../models/MotorcycleModel";

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

    // Initialize models
    UserModel.initialize(sequelize);
    MaintenanceModel.initialize(sequelize);
    InventoryPartModel.initialize(sequelize);
    DriverModel.initialize(sequelize);
    MotorcycleModel.initialize(sequelize);

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("✅ Models synchronized successfully.");

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
