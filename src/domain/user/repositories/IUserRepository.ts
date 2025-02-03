import User from "../../../domain/user/entities/User";
import { Email } from "../../../domain/user/valueObjects/Email";

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<void>;
  exists(email: Email): Promise<boolean>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  update(user: User): Promise<void>;
  count(): Promise<number>;
}
