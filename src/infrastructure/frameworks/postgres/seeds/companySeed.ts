import { faker } from '@faker-js/faker';
import { sequelize } from '../config/database';
import { PostgreSQLCompanyRepository } from '../../../repositories/PostgreSQLCompanyRepository';
import { PostgreSQLUserRepository } from '../../../repositories/PostgreSQLUserRepository';
import { CreateCompanyUseCase } from '../../../../application/company/use-cases/CreateCompanyUseCase';
import { Argon2PasswordHashingService } from '../../../services/Argon2PasswordHashingService';
import { Email } from '../../../../domain/user/valueObjects/Email';

export class CompanySeed {
  private static companyRepository: PostgreSQLCompanyRepository;
  private static userRepository: PostgreSQLUserRepository;
  private static createCompanyUseCase: CreateCompanyUseCase;

  private static initialize() {
    // Initialiser les services
    const passwordHashingService = new Argon2PasswordHashingService();
    this.userRepository = new PostgreSQLUserRepository(passwordHashingService);
    this.companyRepository = new PostgreSQLCompanyRepository();
    this.createCompanyUseCase = new CreateCompanyUseCase(this.companyRepository);
  }

  static async seed(force: boolean = false) {
    // Initialiser les services si nécessaire
    if (!this.createCompanyUseCase) {
      this.initialize();
    }

    try {
      // Synchroniser les modèles avec force pour recréer si force est true
      await sequelize.sync({ force });

      // Récupérer les utilisateurs nécessaires
      const adminUser = await this.userRepository.findByEmail(Email.from('admin@triumph.com'));
      const managerUser = await this.userRepository.findByEmail(Email.from('manager@triumph.com'));
      const standardUser = await this.userRepository.findByEmail(Email.from('user@triumph.com'));

      if (!adminUser || !managerUser || !standardUser) {
        throw new Error('Les utilisateurs requis n\'existent pas. Exécutez d\'abord le userSeed.');
      }

      // Entreprises prédéfinies
      const predefinedCompanies = [
        {
          name: 'Triumph Motorcycles Ltd',
          address: 'Normandy Way, Hinckley, Leicestershire LE10 3BZ, United Kingdom',
          userId: adminUser.id
        },
        {
          name: 'Triumph France',
          address: '25 Avenue de la Grande Armée, 75116 Paris, France',
          userId: managerUser.id
        }
      ];

      // Entreprises supplémentaires
      const additionalCompanies = Array.from({ length: 3 }, () => ({
        name: `${faker.company.name()} Motorcycles`,
        address: faker.location.streetAddress(true),
        userId: standardUser.id
      }));

      // Combiner toutes les entreprises
      const allCompanies = [...predefinedCompanies, ...additionalCompanies];

      // Créer les entreprises
      for (const companyData of allCompanies) {
        try {
          await this.createCompanyUseCase.execute(
            companyData.name,
            companyData.address,
            companyData.userId
          );
          console.log(`Entreprise créée : ${companyData.name}`);
        } catch (error) {
          console.error(`Erreur lors de la création de l'entreprise ${companyData.name}:`, error);
        }
      }

      console.log('Seed des entreprises terminé');
    } catch (error) {
      console.error('Erreur lors du seed de la base de données:', error);
      throw error;
    }
  }
}

// Exécution du seed si lancé directement
if (require.main === module) {
  CompanySeed.seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur lors de l\'exécution du seed:', error);
      process.exit(1);
    });
}
