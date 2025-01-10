import { Company } from "./CompanyEntity";
import { Motorcycle } from "./MotorcycleEntity";

export class CompanyMotorcycle {
    constructor(
        public readonly id: string,
        public readonly companyId: Company,
        public readonly motorcycleId: Motorcycle
    ) {}

}