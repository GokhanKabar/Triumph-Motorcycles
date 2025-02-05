export interface CreateMotorcycleDTO {
  brand: string;
  model: string;
  vin: string;
  concessionId: string;
  currentMileage: number;
}

export interface UpdateMotorcycleDTO {
  brand?: string;
  model?: string;
  vin?: string;
  concessionId?: string;
  currentMileage?: number;
}

export interface MotorcycleResponseDTO {
  id: string;
  brand: string;
  model: string;
  vin: string;
  concessionId: string;
  currentMileage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MotorcycleFormDTO {
  id?: string;
  brand: string;
  model: string;
  vin: string;
  concessionId: string;
  currentMileage: number;
}
