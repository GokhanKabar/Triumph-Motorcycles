import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { IPasswordHashingService } from '../../services/IPasswordHashingService';
import { Email } from '../../../domain/user/valueObjects/Email';
import User from '../../../domain/user/entities/User';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHashingService: IPasswordHashingService
  ) {}

  async execute(params: { email: string; password: string }): Promise<User | Error> {
    console.log('Tentative de connexion avec:', { email: params.email });
    
    const emailOrError = Email.from(params.email);
    if (emailOrError instanceof Error) {
      return emailOrError;
    }

    const user = await this.userRepository.findByEmail(emailOrError);
    console.log('Utilisateur trouvé:', { 
      id: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      role: user?.role
    });

    if (!user) {
      return new Error('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHashingService.verify(params.password, user.password);

    if (!isPasswordValid) {
      return new Error('Invalid credentials');
    }

    return user;
  }
}
