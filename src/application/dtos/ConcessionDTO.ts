export interface CreateConcessionDTO {
  id?: string;
  userId?: string;
  name: string;
  address: string;
}

export interface UpdateConcessionDTO {
  name?: string;
  address?: string;
}

export interface ConcessionFormDTO {
  id?: string;
  userId?: string;
  name: string;
  address: string;
}

export interface ConcessionResponseDTO {
  id: string;
  userId: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteConcessionResponseDTO {
  success: boolean;
  message: string;
  error?: {
    code: 'CONCESSION_NOT_FOUND' | 'CONCESSION_HAS_MOTORCYCLES' | 'INTERNAL_SERVER_ERROR';
    details?: string;
  };
}

export interface DeleteConcessionErrorDTO {
  code: 'CONCESSION_NOT_FOUND' | 'CONCESSION_HAS_MOTORCYCLES' | 'INTERNAL_SERVER_ERROR';
  message: string;
  details?: string;
}
