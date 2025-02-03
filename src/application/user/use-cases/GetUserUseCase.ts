import User from '../../../domain/user/entities/User';
import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';
import { Email } from '../../../domain/user/valueObjects/Email';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async getById(id: string): Promise<User | Error> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      return new UserNotFoundError(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async getByEmail(email: string): Promise<User | Error> {
    const emailVO = Email.from(email);
    
    if (emailVO instanceof Error) {
      return emailVO;
    }

    const user = await this.userRepository.findByEmail(emailVO);
    
    if (!user) {
      return new UserNotFoundError(`Utilisateur avec l'email ${email} non trouvé`);
    }

    return user;
  }

  async getByEmailWithPassword(emailStr: string): Promise<User | Error | null> {
    const email = Email.from(emailStr);
    if (email instanceof Error) {
      return email;
    }
    return this.userRepository.findByEmail(email);
  }

  async getAll(): Promise<User[]> {
    const users = await this.userRepository.findAll();
    return users;
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }
}
