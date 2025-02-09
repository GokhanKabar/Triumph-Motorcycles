import { IUserRepository } from '../../../domain/user';
import { UseCase } from '../../services/UseCase';

export class DeleteUserUseCase implements UseCase<string, boolean> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<boolean> {
    try {

      // Vérifier si l'utilisateur existe avant de le supprimer
      const userExists = await this.userRepository.findById(userId);
      
      if (!userExists) {
        return true;
      }

      // Supprimer l'utilisateur
      await this.userRepository.delete(userId);
      return true;
    } catch (error) {
      throw error;
    }
  }
}
