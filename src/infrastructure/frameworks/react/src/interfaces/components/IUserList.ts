import { UserResponseDTO } from '../../../../../../application/user/dtos/UserDTO';
import { UserRole } from '../../../../../../domain/enums/UserRole';

export interface IUserListProps {
  onEdit: (user: UserResponseDTO) => void;
  onDelete: (userId: string) => void;
}

export interface IUserListState {
  users: UserResponseDTO[];
  isLoading: boolean;
  error: Error | null;
}

export interface IPaginationConfig {
  page: number;
  rowsPerPage: number;
  totalItems: number;
}

export interface IUserListHandlers {
  handleDeleteUser: (userId: string) => Promise<void>;
  getRoleColor: (role: UserRole) => string;
}

export interface IPaginatedData {
  paginatedUsers: UserResponseDTO[];
  paginationConfig: IPaginationConfig;
}
