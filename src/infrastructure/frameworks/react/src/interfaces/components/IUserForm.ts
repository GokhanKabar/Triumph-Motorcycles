import { CreateUserDTO, UserResponseDTO } from '@application/user/dtos/UserDTO';

export interface IUserFormProps {
  open: boolean;
  user?: UserResponseDTO;
  onClose: () => void;
  onSubmit: (user: CreateUserDTO) => void;
}

export interface IUserFormState {
  formData: CreateUserDTO;
  error: string;
}

export interface IUserFormValidation {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  password: boolean;
}
