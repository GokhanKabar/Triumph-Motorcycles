import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { UpdateUserPasswordDTO } from '../dtos/UserDTO';
import { User } from '../../../domain/user';
import { IPasswordHashingService } from '../../services/IPasswordHashingService';
import { UseCase } from '../../services/UseCase';

export class UpdateUserPasswordUseCase implements UseCase<{ userId: string, updatePasswordData: UpdateUserPasswordDTO }, { success: boolean, message: string }> {
  constructor(
    private userRepository: IUserRepository,
    private passwordHashingService: IPasswordHashingService
  ) {}

  async execute(params: { userId: string, updatePasswordData: UpdateUserPasswordDTO }): Promise<{ success: boolean, message: string }> {
    console.log('UpdateUserPasswordUseCase - Début de la mise à jour de mot de passe');
    console.log('Paramètres reçus:', JSON.stringify(params, null, 2));

    // Validation de base
    if (!params.updatePasswordData.password) {
      console.warn('Aucun nouveau mot de passe fourni');
      return {
        success: true,
        message: 'Aucune mise à jour de mot de passe nécessaire'
      };
    }

    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      console.error(`Utilisateur non trouvé avec l'ID: ${params.userId}`);
      throw new Error('Utilisateur non trouvé');
    }

    console.log(`Utilisateur trouvé: ${user.email}`);

    // Si ce n'est pas une mise à jour admin, vérifier le mot de passe actuel
    if (!params.updatePasswordData.isAdminUpdate) {
      const isCurrentPasswordValid = await this.passwordHashingService.verify(
        params.updatePasswordData.currentPassword || '',
        user.password
      );

      if (!isCurrentPasswordValid) {
        console.error('Mot de passe actuel incorrect');
        throw new Error('Mot de passe actuel incorrect');
      }
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await this.passwordHashingService.hash(
      params.updatePasswordData.password
    );

    console.log('Mot de passe haché généré');

    // Mettre à jour le mot de passe
    try {
      await this.userRepository.updatePassword(params.userId, hashedPassword);
      console.log(`Mot de passe mis à jour pour l'utilisateur: ${params.userId}`);
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', updateError);
      throw updateError;
    }

    return {
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    };
  }
}