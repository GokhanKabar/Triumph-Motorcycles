import { Company } from "./CompanyEntity";
import { CompanyMotorcycle } from "./CompanyMotorcycleEntity";

export class Driver {
    constructor(
        public readonly id: string,
        public readonly companyMotorcycleId: CompanyMotorcycle,
        public readonly companyId: Company
    ) {}

}