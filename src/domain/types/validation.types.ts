import { Email, Name, Password } from '../user';
import { UserRole } from '../enums/UserRole';

export interface CreateUserValidationResult {
  firstName: Name;
  lastName: Name;
  email: Email;
  password: Password;
  role: UserRole;
}

export interface UpdateUserValidationResult {
  firstName?: Name;
  lastName?: Name;
  email?: Email;
  role?: UserRole;
}

export interface LoginValidationResult {
  email: Email;
  password: Password;
}

export interface ForgotPasswordValidationResult {
  email: Email;
}

export interface ResetPasswordValidationResult {
  token: string;
  password: Password;
}

export interface UpdatePasswordValidationResult {
  currentPassword: Password | Error;
  newPassword?: Password;
}
