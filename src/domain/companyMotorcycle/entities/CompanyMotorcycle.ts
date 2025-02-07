import { v4 as uuidv4 } from "uuid";

interface MotorcycleDetails {
  id: string;
  brand: string;
  model: string;
  year: number;
}

export interface CompanyMotorcycleProps {
  companyId: string;
  motorcycleId: string;
  motorcycle?: MotorcycleDetails | null;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CompanyMotorcycle {
  readonly id: string;
  readonly companyId: string;
  readonly motorcycleId: string;
  readonly motorcycle?: MotorcycleDetails | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: CompanyMotorcycleProps) {
    this.id = props.id || uuidv4();
    this.companyId = props.companyId;
    this.motorcycleId = props.motorcycleId;
    this.motorcycle = props.motorcycle;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: CompanyMotorcycleProps): CompanyMotorcycle {
    return new CompanyMotorcycle(props);
  }
}
