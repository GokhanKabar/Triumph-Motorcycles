import { sequelize } from "../config/database";
import { PostgreSQLMotorcycleRepository } from "../../../repositories/PostgreSQLMotorcycleRepository";
import { PostgreSQLConcessionRepository } from "../../../repositories/PostgreSQLConcessionRepository";
import { CreateMotorcycleUseCase } from "../../../../application/motorcycle/use-cases/CreateMotorcycleUseCase";

export class MotorcycleSeed {
  private static motorcycleRepository: PostgreSQLMotorcycleRepository;
  private static concessionRepository: PostgreSQLConcessionRepository;
  private static createMotorcycleUseCase: CreateMotorcycleUseCase;

  private static initialize() {
    this.motorcycleRepository = new PostgreSQLMotorcycleRepository();
    this.concessionRepository = new PostgreSQLConcessionRepository();
    this.createMotorcycleUseCase = new CreateMotorcycleUseCase(
      this.motorcycleRepository
    );
  }

  private static generateVIN(): string {
    // Format VIN: 3 VDS + 5 attributs + 1 année + 1 usine + 7 séquentiels
    const characters = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"; // Exclus I, O et Q pour éviter la confusion
    const currentYear = new Date().getFullYear() % 10; // Dernier chiffre de l'année
    const plantCode = "T"; // T pour Triumph

    let vin = "VF7"; // World Manufacturer Identifier (exemple)

    // 5 caractères pour les attributs du véhicule
    for (let i = 0; i < 5; i++) {
      vin += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Année et usine
    vin += currentYear + plantCode;

    // 7 caractères séquentiels
    for (let i = 0; i < 7; i++) {
      vin += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return vin;
  }

  static async seed(force: boolean = false) {
    if (!this.createMotorcycleUseCase) {
      this.initialize();
    }

    try {
      await sequelize.sync({ force });

      // Vérifier si des motos existent déjà
      const motorcycleCount = await this.motorcycleRepository.count();
      if (!force && motorcycleCount > 0) {
        console.log("Des motos existent déjà. Seed ignoré.");
        return;
      }

      // Récupérer toutes les concessions
      const concessions = await this.concessionRepository.findAll();
      if (concessions.length === 0) {
        throw new Error(
          "Aucune concession n'existe. Exécutez d'abord le concessionSeed."
        );
      }

      // Modèles Triumph disponibles avec leurs caractéristiques
      const triumphModels = [
        {
          brand: "Triumph",
          model: "Street Triple RS",
          mileageRange: { min: 0, max: 500 }, // Moto populaire, stock régulier
          quantity: 2, // 2 exemplaires par concession
        },
        {
          brand: "Triumph",
          model: "Speed Triple 1200 RS",
          mileageRange: { min: 0, max: 200 }, // Nouveau modèle
          quantity: 1, // 1 exemplaire par concession
        },
        {
          brand: "Triumph",
          model: "Tiger 900 Rally Pro",
          mileageRange: { min: 0, max: 1000 }, // Moto d'essai
          quantity: 2, // 2 exemplaires par concession
        },
        {
          brand: "Triumph",
          model: "Rocket 3 R",
          mileageRange: { min: 0, max: 300 }, // Moto exclusive
          quantity: 1, // 1 exemplaire par concession
        },
        {
          brand: "Triumph",
          model: "Bonneville T120",
          mileageRange: { min: 0, max: 800 }, // Moto classique
          quantity: 2, // 2 exemplaires par concession
        },
      ];

      // Pour chaque concession
      for (const concession of concessions) {
        console.log(
          `\nCréation des motos pour la concession : ${concession.name}`
        );

        // Pour chaque modèle
        for (const model of triumphModels) {
          // Créer le nombre spécifié d'exemplaires
          for (let i = 0; i < model.quantity; i++) {
            const currentMileage =
              Math.floor(
                Math.random() *
                  (model.mileageRange.max - model.mileageRange.min + 1)
              ) + model.mileageRange.min;

            const vin = this.generateVIN();

            try {
              await this.createMotorcycleUseCase.execute(
                model.brand,
                model.model,
                vin,
                currentMileage,
                concession.id
              );
              console.log(
                `✓ ${model.brand} ${model.model} créée (VIN: ${vin}, km: ${currentMileage})`
              );
            } catch (error) {
              console.error(
                `Erreur lors de la création de la moto ${model.model}:`,
                error
              );
            }
          }
        }
      }

      console.log("\n✅ Seed des motos terminé");
    } catch (error) {
      console.error("Erreur lors du seed de la base de données:", error);
      throw error;
    }
  }
}

// Exécution du seed si lancé directement
if (require.main === module) {
  MotorcycleSeed.seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Erreur lors de l'exécution du seed:", error);
      process.exit(1);
    });
}
