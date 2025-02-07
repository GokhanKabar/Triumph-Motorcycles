export interface CompanyMotorcycleDTO {
    id: string;
    companyId: string;
    motorcycleId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCompanyMotorcycleDTO {
    companyId: string;
    motorcycleId: string;
}
