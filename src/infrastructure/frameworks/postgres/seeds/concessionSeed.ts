import { faker } from "@faker-js/faker";
import { sequelize } from "../config/database";
import { Email } from "../../../../domain/user/valueObjects/Email";
import { PostgreSQLConcessionRepository } from "../../../repositories/PostgreSQLConcessionRepository";
import { PostgreSQLUserRepository } from "../../../repositories/PostgreSQLUserRepository";
import { CreateConcessionUseCase } from "../../../../application/concession/use-cases/CreateConcessionUseCase";
import { Argon2PasswordHashingService } from "../../../services/Argon2PasswordHashingService";

export class ConcessionSeed {
  private static concessionRepository: PostgreSQLConcessionRepository;
  private static userRepository: PostgreSQLUserRepository;
  private static createConcessionUseCase: CreateConcessionUseCase;

  private static initialize() {
    // Initialiser les services
    const passwordHashingService = new Argon2PasswordHashingService();
    this.userRepository = new PostgreSQLUserRepository(passwordHashingService);
    this.concessionRepository = new PostgreSQLConcessionRepository();
    this.createConcessionUseCase = new CreateConcessionUseCase(
      this.concessionRepository
    );
  }

  static async seed(force: boolean = false) {
    // Initialiser les services si nécessaire
    if (!this.createConcessionUseCase) {
      this.initialize();
    }

    try {
      // Synchroniser les modèles avec force pour recréer si force est true
      await sequelize.sync({ force });

      // Si force est false, vérifier s'il existe déjà des concessions
      if (!force) {
        const existingConcessions = await this.concessionRepository.findAll();
        if (existingConcessions.length > 0) {
          console.log("Des concessions existent déjà. Seed ignoré.");
          return;
        }
      }

      // Récupérer les utilisateurs nécessaires
      const managerUser = await this.userRepository.findByEmail(
        Email.from("manager@triumph.com")
      );
      const standardUser = await this.userRepository.findByEmail(
        Email.from("user@triumph.com")
      );

      if (!managerUser || !standardUser) {
        throw new Error(
          "Les utilisateurs requis n'existent pas. Exécutez d'abord le userSeed."
        );
      }

      // Concessions à créer (une seule instance par ville)
      const concessions = [
        {
          name: "Triumph Paris",
          address: "25 Avenue de la Grande Armée, 75116 Paris",
          userId: managerUser.id,
        },
        {
          name: "Triumph Lyon",
          address: "20 Rue de la République, 69002 Lyon",
          userId: standardUser.id,
        },
        {
          name: "Triumph Marseille",
          address: "45 Boulevard Michelet, 13008 Marseille",
          userId: standardUser.id,
        },
        {
          name: "Triumph Bordeaux",
          address: "15 Cours de l'Intendance, 33000 Bordeaux",
          userId: standardUser.id,
        },
        {
          name: "Triumph Lille",
          address: "100 Rue Nationale, 59000 Lille",
          userId: standardUser.id,
        },
        {
          name: "Triumph Nantes",
          address: "4 Rue Voltaire, 44000 Nantes",
          userId: standardUser.id,
        },
        {
          name: "Triumph Strasbourg",
          address: "3 Rue du 22 Novembre, 67000 Strasbourg",
          userId: standardUser.id,
        },
        {
          name: "Triumph Toulouse",
          address: "12 Boulevard de Strasbourg, 31000 Toulouse",
          userId: standardUser.id,
        },
      ];

      // Créer les concessions
      for (const concessionData of concessions) {
        try {
          await this.createConcessionUseCase.execute(
            concessionData.name,
            concessionData.address,
            concessionData.userId
          );
          console.log(`Concession créée : ${concessionData.name}`);
        } catch (error) {
          console.error(
            `Erreur lors de la création de la concession ${concessionData.name}:`,
            error
          );
        }
      }

      console.log("Seed des concessions terminé");
    } catch (error) {
      console.error("Erreur lors du seed de la base de données:", error);
      throw error;
    }
  }
}

// Exécution du seed si lancé directement
if (require.main === module) {
  ConcessionSeed.seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Erreur lors de l'exécution du seed:", error);
      process.exit(1);
    });
}
