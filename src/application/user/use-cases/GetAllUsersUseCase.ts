import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { UserResponseDTO } from '../../../application/user/dtos/UserDTO';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    
    return users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      password: user.password
    }));
  }
}
