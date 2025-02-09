import { MotorcycleStatus } from '@domain/motorcycle/enums/MotorcycleStatus';

export interface MotorcycleDTO {
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

export type MotorcycleResponseDTO = MotorcycleDTO;
