import { Company } from "./CompanyEntity";
import { CompanyMotorcycle } from "./CompanyMotorcycleEntity";

export class Driver {
  constructor(
    public readonly id: string,
    public readonly companyMotorcycleId: CompanyMotorcycle,
    public readonly companyId: Company,
    public readonly licenseNumber: string,
    public readonly experienceYears: number,
    public readonly name: string
  ) {}
}
