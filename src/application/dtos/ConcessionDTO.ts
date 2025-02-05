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
