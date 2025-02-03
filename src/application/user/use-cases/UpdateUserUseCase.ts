import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { UpdateUserDTO, UserResponseDTO } from '../dtos/UserDTO';
import { UserNotFoundError } from '../../errors/ApplicationError';
import User from '../../../domain/user/entities/User';
import { Email } from '../../../domain/user/valueObjects/Email';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, updateData: UpdateUserDTO): Promise<UserResponseDTO> {
    // Récupérer l'utilisateur existant
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new UserNotFoundError(userId);
    }

    // Vérifier si l'email est modifié et s'il est unique
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailResult = Email.from(updateData.email);
      if (emailResult instanceof Error) {
        throw emailResult;
      }
      const emailExists = await this.userRepository.exists(emailResult);
      if (emailExists) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
    }

    // Créer un nouvel utilisateur avec les données mises à jour
    const updatedUser = User.from(
      existingUser.id,
      updateData.firstName || existingUser.firstName,
      updateData.lastName || existingUser.lastName,
      updateData.email || existingUser.email,
      existingUser.password,
      updateData.role || existingUser.role,
      existingUser.createdAt,
      new Date()
    );

    if (updatedUser instanceof Error) {
      throw updatedUser;
    }

    // Sauvegarder l'utilisateur mis à jour
    await this.userRepository.update(updatedUser);

    // Retourner la réponse
    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt.toISOString()
    };
  }
}
