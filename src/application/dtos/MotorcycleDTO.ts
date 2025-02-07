import { MotorcycleStatus } from "../../domain/motorcycle/enums/MotorcycleStatus";

export interface CreateMotorcycleDTO {
  brand: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  status?: MotorcycleStatus;
  concessionId: string;
}

export interface UpdateMotorcycleDTO {
  brand?: string;
  model?: string;
  year?: number;
  vin?: string;
  mileage?: number;
  status?: MotorcycleStatus;
  concessionId?: string;
}

export interface MotorcycleResponseDTO {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  status: MotorcycleStatus;
  concessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MotorcycleFormDTO {
  id?: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  status?: MotorcycleStatus;
  concessionId: string;
}
