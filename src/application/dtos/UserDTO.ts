import { UserRole } from '../../domain/enums/UserRole';

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface UserResponseDTO {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
