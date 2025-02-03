import { IUserRepository } from '../../domain/user/repositories/IUserRepository';
import User from '../../domain/user/entities/User';
import { Email } from '../../domain/user/valueObjects/Email';
import { IPasswordHashingService } from '../../application/services/IPasswordHashingService';
import  UserModel  from '../frameworks/postgres/models/UserModel';
import { UniqueConstraintError } from 'sequelize';
import { UserValidationError } from '../../domain/user/entities/User';
import { MissingRequiredFieldError } from '../../domain/errors/MissingRequiredFieldError';
import { UserNotFoundError } from '../../domain/errors/UserNotFoundError';

export class PostgreSQLUserRepository implements IUserRepository {
  constructor(private readonly passwordHashingService: IPasswordHashingService) {}

  async save(user: User): Promise<void> {
    try {
      await UserModel.create({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new UserValidationError('Un utilisateur avec cet email existe déjà');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const userModel = await UserModel.findByPk(id);
    if (!userModel) return null;

    const user = User.from(
      userModel.id,
      userModel.firstName,
      userModel.lastName,
      userModel.email,
      userModel.password,
      userModel.role,
      userModel.createdAt,
      userModel.updatedAt
    );

    if (user instanceof MissingRequiredFieldError) {
      throw new Error('Données utilisateur corrompues dans la base de données');
    }

    return user;
  }

  async findByEmail(email: Email): Promise<User | null> {
    console.log('Recherche utilisateur avec email:', email.value);
    
    const userModel = await UserModel.findOne({ where: { email: email.value } });
    if (!userModel) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return null;
    }

    console.log('Données utilisateur trouvées:', {
      id: userModel.id,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      email: userModel.email,
      role: userModel.role,
      password: userModel.password
    });

    const user = User.from(
      userModel.id,
      userModel.firstName,
      userModel.lastName,
      userModel.email,
      userModel.password,
      userModel.role,
      userModel.createdAt,
      userModel.updatedAt
    );

    if (user instanceof MissingRequiredFieldError) {
      console.error('Erreur de validation:', {
        id: userModel.id,
        firstName: !!userModel.firstName,
        lastName: !!userModel.lastName,
        email: !!userModel.email
      });
      throw new Error('Données utilisateur corrompues dans la base de données');
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    const userModels = await UserModel.findAll();
    return userModels.map(userModel => {
      const user = User.from(
        userModel.id,
        userModel.firstName,
        userModel.lastName,
        userModel.email,
        userModel.password,
        userModel.role,
        userModel.createdAt,
        userModel.updatedAt
      );

      if (user instanceof MissingRequiredFieldError) {
        throw new Error('Données utilisateur corrompues dans la base de données');
      }

      return user;
    });
  }

  async count(): Promise<number> {
    return await UserModel.count();
  }

  async exists(email: Email): Promise<boolean> {
    const count = await UserModel.count({ where: { email: email.value } });
    return count > 0;
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    console.log(`PostgreSQLUserRepository - Mise à jour du mot de passe pour l'utilisateur: ${userId}`);
    console.log(`Nouveau mot de passe haché: ${hashedPassword.substring(0, 10)}...`);

    try {
      const result = await UserModel.update(
        { password: hashedPassword },
        { where: { id: userId } }
      );

      console.log('Résultat de la mise à jour:', result);

      if (result[0] === 0) {
        console.error(`Aucun utilisateur mis à jour avec l'ID: ${userId}`);
        throw new Error(`Impossible de mettre à jour le mot de passe pour l'utilisateur ${userId}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  }

  async update(user: User): Promise<void> {
    try {
      await UserModel.update(
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          updatedAt: new Date()
        },
        { where: { id: user.id } }
      );
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new UserValidationError('Un utilisateur avec cet email existe déjà');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const result = await UserModel.destroy({ where: { id } });
    
    console.log(`Tentative de suppression de l'utilisateur ${id}. Lignes supprimées: ${result}`);
  }
}
