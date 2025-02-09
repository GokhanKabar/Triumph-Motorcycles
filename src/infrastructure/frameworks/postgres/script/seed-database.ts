import { Sequelize } from "sequelize";
import UserModel from "../models/UserModel";
import { UserSeed } from "../seeds/userSeed";
import { CompanySeed } from "../seeds/companySeed";
import { ConcessionSeed } from "../seeds/concessionSeed";
import { MotorcycleSeed } from "../seeds/motorcycleSeed";
import { MaintenanceSeed } from "../seeds/maintenanceSeed";
import { InventoryPartSeed } from "../seeds/inventoryPartSeed";
import { DriverSeed } from "../seeds/driverSeed";
import { seedCompanyMotorcycles } from "../seeds/companyMotorcycleSeed";
import { TestRideSeed } from '../seeds/testRideSeed';
import { IncidentSeed } from '../seeds/incidentSeed';

export async function seedDatabase(
  sequelize?: Sequelize,
  force: boolean = false
): Promise<void> {
  try {
    console.log("🌱 Starting database seeding process...");

    if (!sequelize) {
      throw new Error("No Sequelize instance provided");
    }

    const userCount = await UserModel.count();

    if (userCount === 0 || force) {
      console.log(
        force
          ? "🔄 Force seeding database..."
          : "📊 No data found. Initiating seed process..."
      );

      // 1. Seed Users
      console.log("👤 Seeding users...");
      await UserSeed.seed(force);

      // 2. Seed Companies
      console.log("🏢 Seeding companies...");
      await CompanySeed.seed(force);

      // 3. Seed Concessions
      console.log("💼 Seeding concessions...");
      await ConcessionSeed.seed(force);

      // 4. Seed Motorcycles
      console.log("🏍 Seeding motorcycles...");
      await MotorcycleSeed.seed(force);

      // 5. Seed Drivers
      console.log("🚚 Seeding drivers...");
      await DriverSeed.seed(sequelize, force);

      // 6. Seed Maintenances
      console.log("🔧 Seeding maintenances...");
      await MaintenanceSeed.seed(force, sequelize);

      // 7. Seed Inventory Parts
      console.log("🛠️ Seeding inventory parts...");
      await InventoryPartSeed.seed(force, sequelize);

      // 8. Seed Company Motorcycles
      await seedCompanyMotorcycles(sequelize);

      // 9. Seed Test Rides
      console.log("🏁 Seeding test rides...");
      await TestRideSeed.seed(force);

      // 10. Seed Incidents
      console.log("🚨 Seeding incidents...");
      await IncidentSeed.seed(sequelize, force);

      console.log("✅ Database seeded successfully.");
    } else {
      console.log(
        `📊 Database already contains ${userCount} users. Use force=true to reseed.`
      );
    }
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
}
