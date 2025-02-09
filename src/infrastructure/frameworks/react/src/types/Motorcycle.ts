import { MotorcycleStatus } from './MotorcycleStatus';

export interface Motorcycle {
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

export interface CreateMotorcycleForm {
  brand: string;
  model: string;
  vin: string;
  mileage: number;
  concessionId: string;
}

export interface UpdateMotorcycleForm extends CreateMotorcycleForm {
  id: string;
}
