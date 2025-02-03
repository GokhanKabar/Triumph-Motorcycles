import { UserRole } from '../../../domain/enums/UserRole';

export interface CreateUserDTO {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserPasswordDTO {
  currentPassword?: string;  // Optionnel, utilisé pour la vérification
  password?: string;         // Nouveau mot de passe
  isAdminUpdate?: boolean;   // Indique si c'est une mise à jour par un admin
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserFormDTO {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;  // Un seul champ pour changer le mot de passe
  role: UserRole;
}

export interface UserResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
  update?: () => void;  
  toJSON?: () => Record<string, unknown>;  
}

export interface PasswordUpdateRequest {
  currentPassword?: string;
  password: string;
}

export interface PasswordUpdateResponse {
  success: boolean;
  message: string;
}
