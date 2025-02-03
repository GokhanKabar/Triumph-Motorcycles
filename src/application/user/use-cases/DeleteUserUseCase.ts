import { IUserRepository } from '../../../domain/user';
import { UseCase } from '../../services/UseCase';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';

export class DeleteUserUseCase implements UseCase<string, boolean> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<boolean> {
    try {
      console.log('Tentative de suppression de l\'utilisateur avec ID:', userId);

      // Vérifier si l'utilisateur existe avant de le supprimer
      const userExists = await this.userRepository.findById(userId);
      
      if (!userExists) {
        console.log(`Utilisateur ${userId} déjà supprimé`);
        return true;
      }

      // Supprimer l'utilisateur
      await this.userRepository.delete(userId);
      
      console.log(`Utilisateur ${userId} supprimé avec succès`);
      
      return true;
    } catch (error) {
      // Si la suppression échoue, propager l'erreur
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }
}
