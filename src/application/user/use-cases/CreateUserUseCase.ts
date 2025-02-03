import User from "../../../domain/user/entities/User";
import { Email } from "../../../domain/user/valueObjects/Email";
import { UserAlreadyExistsError } from "../../../domain/errors/UserAlreadyExistsError";
import { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import { IPasswordHashingService } from "../../services/IPasswordHashingService";
import { UserRole } from "../../../domain/enums/UserRole";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHashingService: IPasswordHashingService,
  ) {}

  async execute(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: UserRole = UserRole.USER
  ): Promise<User | Error> {
    const emailVO = Email.from(email);
    if (emailVO instanceof Error) {
      return emailVO;
    }

    const exists = await this.userRepository.exists(emailVO);
    if (exists) {
      return new UserAlreadyExistsError();
    }

    const hashedPassword = await this.passwordHashingService.hash(password);
    
    const user = User.from(
      undefined,
      firstName,
      lastName,
      email,
      hashedPassword,
      role,
    );

    if (user instanceof Error) {
      return user;
    }

    await this.userRepository.save(user);
    return user;
  }
}