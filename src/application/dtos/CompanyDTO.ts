export interface CreateCompanyDTO {
  id?: string;
  userId?: string;
  name: string;
  address: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  address?: string;
}

export interface CompanyFormDTO {
  id?: string;
  userId?: string;
  name: string;
  address: string;
}

export interface CompanyResponseDTO {
  id: string;
  userId: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
  update?: () => void;
  toJSON?: () => Record<string, unknown>;
}
