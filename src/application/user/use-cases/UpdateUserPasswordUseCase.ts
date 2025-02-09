import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { UpdateUserPasswordDTO } from '../dtos/UserDTO';
import { IPasswordHashingService } from '../../services/IPasswordHashingService';
import { UseCase } from '../../services/UseCase';

export class UpdateUserPasswordUseCase implements UseCase<{ userId: string, updatePasswordData: UpdateUserPasswordDTO }, { success: boolean, message: string }> {
  constructor(
    private userRepository: IUserRepository,
    private passwordHashingService: IPasswordHashingService
  ) {}

  async execute(params: { userId: string, updatePasswordData: UpdateUserPasswordDTO }): Promise<{ success: boolean, message: string }> {

    // Validation de base
    if (!params.updatePasswordData.password) {
      return {
        success: true,
        message: 'Aucune mise à jour de mot de passe nécessaire'
      };
    }

    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si ce n'est pas une mise à jour admin, vérifier le mot de passe actuel
    if (!params.updatePasswordData.isAdminUpdate) {
      const isCurrentPasswordValid = await this.passwordHashingService.verify(
        params.updatePasswordData.currentPassword || '',
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Mot de passe actuel incorrect');
      }
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await this.passwordHashingService.hash(
      params.updatePasswordData.password
    );

    // Mettre à jour le mot de passe
    try {
      await this.userRepository.updatePassword(params.userId, hashedPassword);
    } catch (updateError) {
      throw updateError;
    }

    return {
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    };
  }
}