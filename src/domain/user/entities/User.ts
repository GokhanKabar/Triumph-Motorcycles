import { UserRole } from '../../enums/UserRole';
import { v4 as uuidv4 } from 'uuid';
import { MissingRequiredFieldError } from '../../errors/MissingRequiredFieldError';

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserValidationError';
  }
}

export default class User {
  private constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) { }

  public static from(
    id: string | undefined,
    firstNameValue: string,
    lastNameValue: string,
    emailValue: string,
    passwordValue: string,
    role: UserRole,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    if (!emailValue) {
      return new MissingRequiredFieldError();
    }

    if (!passwordValue) {
      return new MissingRequiredFieldError();
    }

    return new User(
      id || uuidv4(),
      firstNameValue || '',
      lastNameValue || '',
      emailValue,
      passwordValue,
      role,
      createdAt || new Date(),
      updatedAt || new Date(),
    );
  }

  public update(
    firstNameValue?: string,
    lastNameValue?: string,
    emailValue?: string,
    passwordValue?: string,
    role?: UserRole,
  ) {
    return new User(
      this.id,
      firstNameValue || this.firstName,
      lastNameValue || this.lastName,
      emailValue || this.email,
      passwordValue || this.password,
      role || this.role,
      this.createdAt,
      new Date(),
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
