import { IValidationService } from '../../application/services/IValidationService';
import { UserRole } from '../../domain/enums/UserRole';
import { Email } from '../../domain/user/valueObjects/Email';
import { Name } from '../../domain/user/valueObjects/Name';
import { Password } from '../../domain/user/valueObjects/Password';
import { CreateUserValidationResult, UpdateUserValidationResult, LoginValidationResult, ForgotPasswordValidationResult, ResetPasswordValidationResult, UpdatePasswordValidationResult } from '../../domain/types/validation.types';
import { UpdateUserPasswordDTO } from '../../application/user/dtos/UserDTO';
import { PartCategory } from '../../domain/inventory/entities/InventoryPart';

export class ValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
  }
}

class ValidationService implements IValidationService {
  async validate<T>(data: unknown, type: 'createUser' | 'updateUser' | 'login' | 'forgotPassword' | 'resetPassword' | 'updatePassword' | 'createInventoryPart' | 'updateInventoryPart' | 'manageStock'): Promise<T> {
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
      case 'createInventoryPart':
        const validationResult = this.validateCreateInventoryPart(data);
        if (!validationResult.success) {
          throw new ValidationError(validationResult.errors || []);
        }
        return data as T;
      case 'updateInventoryPart':
        const updateValidationResult = this.validateUpdateInventoryPart(data);
        if (!updateValidationResult.success) {
          throw new ValidationError(updateValidationResult.errors || []);
        }
        return data as T;
      case 'manageStock':
        const stockValidationResult = this.validateManageStock(data);
        if (!stockValidationResult.success) {
          throw new ValidationError(stockValidationResult.errors || []);
        }
        return data as T;
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

  private validateCreateInventoryPart(data: unknown): { success: boolean; errors?: string[] } {
    const errors: string[] = [];
    const typedData = data as any;

    // Validation du nom
    if (!typedData.name || typeof typedData.name !== 'string' || typedData.name.trim() === '') {
      errors.push('Le nom de la pièce est requis');
    }

    // Validation de la catégorie
    if (!typedData.category || !Object.values(PartCategory).includes(typedData.category)) {
      errors.push('Une catégorie valide est requise');
    }

    // Validation du numéro de référence
    if (!typedData.referenceNumber || typeof typedData.referenceNumber !== 'string' || typedData.referenceNumber.trim() === '') {
      errors.push('Le numéro de référence est requis');
    }

    // Validation du stock actuel
    if (typedData.currentStock === undefined || typeof typedData.currentStock !== 'number' || typedData.currentStock < 0) {
      errors.push('Le stock actuel est requis et doit être un nombre positif');
    }

    // Validation du seuil de stock minimum
    if (typedData.minStockThreshold === undefined || typeof typedData.minStockThreshold !== 'number' || typedData.minStockThreshold < 0) {
      errors.push('Le seuil de stock minimum est requis et doit être un nombre positif');
    }

    // Validation du prix unitaire
    if (typedData.unitPrice === undefined || typeof typedData.unitPrice !== 'number' || typedData.unitPrice < 0) {
      errors.push('Le prix unitaire est requis et doit être un nombre positif');
    }

    // Validation des modèles de motos
    if (!typedData.motorcycleModels || !Array.isArray(typedData.motorcycleModels) || typedData.motorcycleModels.length === 0) {
      errors.push('Au moins un modèle de moto est requis');
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateUpdateInventoryPart(data: unknown): { success: boolean; errors?: string[] } {
    const errors: string[] = [];
    const typedData = data as any;

    // Validation du nom
    if (typedData.name && (typeof typedData.name !== 'string' || typedData.name.trim().length === 0)) {
      errors.push('Le nom de la pièce doit être une chaîne non vide');
    }

    // Validation du numéro de référence
    if (typedData.referenceNumber && (typeof typedData.referenceNumber !== 'string' || typedData.referenceNumber.trim().length === 0)) {
      errors.push('Le numéro de référence doit être une chaîne non vide');
    }

    // Validation de la catégorie
    if (typedData.category && (typeof typedData.category !== 'string' || typedData.category.trim().length === 0)) {
      errors.push('La catégorie doit être une chaîne non vide');
    }

    // Validation du prix unitaire
    if (typedData.unitPrice !== undefined && (typeof typedData.unitPrice !== 'number' || typedData.unitPrice < 0)) {
      errors.push('Le prix unitaire doit être un nombre positif');
    }

    // Validation du seuil de stock minimum
    if (typedData.minStockThreshold !== undefined && (typeof typedData.minStockThreshold !== 'number' || typedData.minStockThreshold < 0)) {
      errors.push('Le seuil de stock minimum doit être un nombre positif');
    }

    // Validation des modèles de moto compatibles
    if (typedData.motorcycleModels !== undefined) {
      if (!Array.isArray(typedData.motorcycleModels)) {
        errors.push('Les modèles de moto doivent être un tableau');
      } else {
        typedData.motorcycleModels.forEach((model: any, index: number) => {
          if (typeof model !== 'string' || model.trim().length === 0) {
            errors.push(`Le modèle de moto à l'index ${index} doit être une chaîne non vide`);
          }
        });
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateManageStock(data: unknown): { success: boolean; errors?: string[] } {
    const errors: string[] = [];
    const typedData = data as any;

    // Validation de l'ID de la pièce
    if (!typedData.partId || typeof typedData.partId !== 'string') {
      errors.push('L\'ID de la pièce est requis');
    }

    // Validation de la quantité
    if (typedData.quantityChange === undefined || typeof typedData.quantityChange !== 'number') {
      errors.push('La quantité doit être un nombre');
    }

    // Validation de l'action
    if (!typedData.action || !['add', 'remove'].includes(typedData.action)) {
      errors.push('L\'action doit être "add" ou "remove"');
    }

    // Validation de la quantité en fonction de l'action
    if (typedData.action === 'add' && typedData.quantityChange <= 0) {
      errors.push('La quantité à ajouter doit être un nombre positif');
    }
    if (typedData.action === 'remove' && typedData.quantityChange >= 0) {
      errors.push('La quantité à retirer doit être un nombre négatif');
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

export { ValidationService };
