import { IValidationService } from '../../application/services/IValidationService';
import { UserRole } from '../../domain/enums/UserRole';
import { Email } from '../../domain/user/valueObjects/Email';
import { Name } from '../../domain/user/valueObjects/Name';
import { Password } from '../../domain/user/valueObjects/Password';
import { CreateUserValidationResult, UpdateUserValidationResult, LoginValidationResult, ForgotPasswordValidationResult, ResetPasswordValidationResult, UpdatePasswordValidationResult } from '../../domain/types/validation.types';
import { UpdateUserPasswordDTO } from '../../application/user/dtos/UserDTO';

export class ValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
  }
}

class ValidationService implements IValidationService {
  async validate<T>(data: unknown, type: 'createUser' | 'updateUser' | 'login' | 'forgotPassword' | 'resetPassword' | 'updatePassword'): Promise<T> {
    switch (type) {
      case 'createUser':
        return this.validateCreateUser(data) as T;
      case 'updateUser':
        return this.validateUpdateUser(data) as T;
      case 'login':
        return this.validateLogin(data) as T;
      case 'forgotPassword':
        return this.validateForgotPassword(data) as T;
      case 'resetPassword':
        return this.validateResetPassword(data) as T;
      case 'updatePassword':
        const passwordData = data as UpdateUserPasswordDTO;
        return this.validateUpdatePassword(passwordData) as T;
      default:
        throw new ValidationError(['Type de validation invalide']);
    }
  }

  private validateCreateUser(data: unknown): CreateUserValidationResult {
    const errors: string[] = [];
    const typedData = data as any;

    if (!typedData.firstName || typeof typedData.firstName !== 'string') {
      errors.push('Le prénom est requis');
    }
    if (!typedData.lastName || typeof typedData.lastName !== 'string') {
      errors.push('Le nom est requis');
    }
    if (!typedData.email || typeof typedData.email !== 'string') {
      errors.push('L\'email est requis');
    }
    if (!typedData.password || typeof typedData.password !== 'string' || typedData.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    if (!typedData.role || !Object.values(UserRole).includes(typedData.role)) {
      errors.push('Le rôle est invalide');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const firstName = Name.from(typedData.firstName);
    const lastName = Name.from(typedData.lastName);
    const email = Email.from(typedData.email);
    const password = Password.from(typedData.password);

    if (firstName instanceof Error) throw new ValidationError([firstName.message]);
    if (lastName instanceof Error) throw new ValidationError([lastName.message]);
    if (email instanceof Error) throw new ValidationError([email.message]);
    if (password instanceof Error) throw new ValidationError([password.message]);

    return {
      firstName,
      lastName,
      email,
      password,
      role: typedData.role
    };
  }

  private validateUpdateUser(data: unknown): UpdateUserValidationResult {
    const errors: string[] = [];
    const typedData = data as any;
    const result: UpdateUserValidationResult = {};

    if (typedData.firstName !== undefined) {
      if (typeof typedData.firstName !== 'string') {
        errors.push('Le prénom doit être une chaîne de caractères');
      } else {
        const firstName = Name.from(typedData.firstName);
        if (firstName instanceof Error) {
          errors.push(firstName.message);
        } else {
          result.firstName = firstName;
        }
      }
    }

    if (typedData.lastName !== undefined) {
      if (typeof typedData.lastName !== 'string') {
        errors.push('Le nom doit être une chaîne de caractères');
      } else {
        const lastName = Name.from(typedData.lastName);
        if (lastName instanceof Error) {
          errors.push(lastName.message);
        } else {
          result.lastName = lastName;
        }
      }
    }

    if (typedData.email !== undefined) {
      if (typeof typedData.email !== 'string') {
        errors.push('L\'email doit être une chaîne de caractères');
      } else {
        const email = Email.from(typedData.email);
        if (email instanceof Error) {
          errors.push(email.message);
        } else {
          result.email = email;
        }
      }
    }

    if (typedData.role !== undefined) {
      if (!Object.values(UserRole).includes(typedData.role)) {
        errors.push('Le rôle est invalide');
      } else {
        result.role = typedData.role;
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    return result;
  }

  private validateLogin(data: unknown): LoginValidationResult {
    const errors: string[] = [];
    const typedData = data as any;

    if (!typedData.email || typeof typedData.email !== 'string') {
      errors.push('L\'email est requis');
    }
    if (!typedData.password || typeof typedData.password !== 'string') {
      errors.push('Le mot de passe est requis');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const email = Email.from(typedData.email);
    const password = Password.from(typedData.password);

    if (email instanceof Error) throw new ValidationError([email.message]);
    if (password instanceof Error) throw new ValidationError([password.message]);

    return { email, password };
  }

  private validateForgotPassword(data: unknown): ForgotPasswordValidationResult {
    const errors: string[] = [];
    const typedData = data as any;

    if (!typedData.email || typeof typedData.email !== 'string') {
      errors.push('L\'email est requis');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const email = Email.from(typedData.email);
    if (email instanceof Error) throw new ValidationError([email.message]);

    return { email };
  }

  private validateResetPassword(data: unknown): ResetPasswordValidationResult {
    const errors: string[] = [];
    const typedData = data as any;

    if (!typedData.token || typeof typedData.token !== 'string') {
      errors.push('Le token est requis');
    }
    if (!typedData.password || typeof typedData.password !== 'string' || typedData.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const password = Password.from(typedData.password);
    if (password instanceof Error) throw new ValidationError([password.message]);

    return { 
      token: typedData.token,
      password
    };
  }

  private async validateUpdatePassword(data: UpdateUserPasswordDTO): Promise<UpdatePasswordValidationResult> {
    // Validate presence of passwords
    if (!data.password || !data.currentPassword) {
      throw new ValidationError(['Mot de passe requis']);
    }

    // Validate password complexity
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
    if (!complexityRegex.test(data.password)) {
      throw new ValidationError(['Le mot de passe ne respecte pas les critères de complexité']);
    }

    // Attempt to create new password
    const newPasswordResult = Password.from(data.password);
    if (newPasswordResult instanceof Error) {
      throw new ValidationError([newPasswordResult.message || 'Impossible de créer un nouveau mot de passe']);
    }

    return {
      currentPassword: data.currentPassword,
      ...(newPasswordResult instanceof Error ? {} : { newPassword: newPasswordResult as Password })
    };
  }
}

export { ValidationService };
