import { hash, verify } from "argon2";
import { IPasswordHashingService } from "../../application/services/IPasswordHashingService";

export class Argon2PasswordHashingService implements IPasswordHashingService {
  async hash(password: string): Promise<string> {
    return await hash(password);
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return await verify(hashedPassword, password);
  }
}
