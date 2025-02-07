import { Sequelize } from "sequelize";
import CompanyMotorcycleModel from "../models/CompanyMotorcycleModel";
import CompanyModel from "../models/CompanyModel";
import MotorcycleModel from "../models/MotorcycleModel";

export async function seedCompanyMotorcycles(
  sequelize: Sequelize
): Promise<void> {
  console.log("🏍 Seeding company motorcycles...");

  try {
    // S'assurer que le modèle est initialisé
    if (!CompanyMotorcycleModel.getInitializationStatus()) {
      console.log("Initializing CompanyMotorcycleModel for seeding...");
      CompanyMotorcycleModel.initialize(sequelize);
    }

    // Attendre que la synchronisation soit terminée
    await sequelize.sync();

    // Vérifier si des associations existent déjà
    const count = await CompanyMotorcycleModel.count();
    if (count > 0) {
      console.log("📊 Company motorcycles already seeded. Skipping...");
      return;
    }

    // Récupérer toutes les entreprises
    const companies = await CompanyModel.findAll();
    // Récupérer toutes les motos
    const motorcycles = await MotorcycleModel.findAll();

    if (companies.length === 0 || motorcycles.length === 0) {
      console.log(
        "⚠️ No companies or motorcycles found. Skipping company motorcycles seed."
      );
      return;
    }

    // Créer quelques associations aléatoires
    const associations = [];
    for (const company of companies) {
      // Associer 2-4 motos aléatoires à chaque entreprise
      const numMotorcycles = Math.floor(Math.random() * 3) + 2;
      const shuffledMotorcycles = [...motorcycles].sort(
        () => Math.random() - 0.5
      );

      for (
        let i = 0;
        i < Math.min(numMotorcycles, shuffledMotorcycles.length);
        i++
      ) {
        associations.push({
          companyId: company.get("id"),
          motorcycleId: shuffledMotorcycles[i].get("id"),
        });
      }
    }

    // Créer les associations dans la base de données
    await CompanyMotorcycleModel.bulkCreate(associations);
    console.log(
      `✅ Created ${associations.length} company-motorcycle associations`
    );
  } catch (error) {
    console.error("❌ Error seeding company motorcycles:", error);
    throw error;
  }
}
