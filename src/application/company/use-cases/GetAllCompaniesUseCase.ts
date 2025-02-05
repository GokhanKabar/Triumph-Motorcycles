import { ICompanyRepository } from "../../../domain/company/repositories/ICompanyRepository";
import { CompanyDTO } from "../dtos/CompanyDTO";

export class GetAllCompaniesUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(): Promise<CompanyDTO[]> {
    const companies = await this.companyRepository.findAll();
    return companies.map(company => ({
      id: company.id,
      name: company.name,
      address: company.address,
      userId: company.userId,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }));
  }
}
