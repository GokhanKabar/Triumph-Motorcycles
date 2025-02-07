import { CompanyMotorcycle } from "../entities/CompanyMotorcycle";

export interface ICompanyMotorcycleRepository {
    save(companyMotorcycle: CompanyMotorcycle): Promise<void>;
    findByCompanyId(companyId: string): Promise<CompanyMotorcycle[]>;
    findByMotorcycleId(motorcycleId: string): Promise<CompanyMotorcycle[]>;
    findByCompanyAndMotorcycleId(companyId: string, motorcycleId: string): Promise<CompanyMotorcycle | null>;
    delete(companyMotorcycle: CompanyMotorcycle): Promise<void>;
}
