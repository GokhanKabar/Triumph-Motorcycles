import { faker } from '@faker-js/faker';
import { sequelize } from '../config/database';
import { UserRole } from '../../../../domain/enums/UserRole';
import { Argon2PasswordHashingService } from '../../../services/Argon2PasswordHashingService';
import { PostgreSQLUserRepository } from '../../../repositories/PostgreSQLUserRepository';
import { CreateUserUseCase } from '../../../../application/user/use-cases/CreateUserUseCase';

export class UserSeed {
  private static passwordHashingService: Argon2PasswordHashingService;
  private static userRepository: PostgreSQLUserRepository;
  private static createUserUseCase: CreateUserUseCase;

  private static initialize() {
    // Initialiser les services
    this.passwordHashingService = new Argon2PasswordHashingService();
    this.userRepository = new PostgreSQLUserRepository(this.passwordHashingService);
    this.createUserUseCase = new CreateUserUseCase(this.userRepository, this.passwordHashingService);
  }

  static async seed(force: boolean = false) {
    // Initialiser les services si nécessaire
    if (!this.createUserUseCase) {
      this.initialize();
    }

    try {
      // Synchroniser les modèles avec force pour recréer si force est true
      await sequelize.sync({ force });

      // Vérifier si des utilisateurs existent déjà 
      const userCount = await this.userRepository.count();
      if (!force && userCount > 0) {
        console.log('Des utilisateurs existent déjà. Seed ignoré.');
        return;
      }

      // Utilisateurs prédéfinis
      const predefinedUsers = [
        {
          firstName: 'Admin',
          lastName: 'Principal',
          email: 'admin@triumph.com',
          password: 'AdminPassword123!',
          role: UserRole.ADMIN
        },
        {
          firstName: 'Manager',
          lastName: 'Principal',
          email: 'manager@triumph.com',
          password: 'ManagerPassword123!',
          role: UserRole.MANAGER
        },
        {
          firstName: 'User',
          lastName: 'Standard',
          email: 'user@triumph.com',
          password: 'UserPassword123!',
          role: UserRole.USER
        }
      ];

      // Utilisateurs supplémentaires
      const additionalUsers = Array.from({ length: 7 }, () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: Object.values(UserRole)[Math.floor(Math.random() * Object.values(UserRole).length)]
      }));

      // Combiner tous les utilisateurs
      const allUsers = [...predefinedUsers, ...additionalUsers];

      // Créer les utilisateurs
      for (const userData of allUsers) {
        try {
          await this.createUserUseCase.execute(
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.password,
            userData.role
          );
          console.log(`Utilisateur créé : ${userData.email} (${userData.role})`);
        } catch (error) {
          console.error(`Erreur lors de la création de l'utilisateur ${userData.email}:`, error);
        }
      }

      console.log('Seed des utilisateurs terminé');
    } catch (error) {
      console.error('Erreur lors du seed de la base de données:', error);
      throw error;
    }
  }
}

// Exécution du seed si lancé directement
if (require.main === module) {
  UserSeed.seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
