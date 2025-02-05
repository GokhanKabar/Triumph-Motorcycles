import { ICompanyRepository } from "../../../domain/company/repositories/ICompanyRepository";
import { CompanyDTO } from "../dtos/CompanyDTO";
import { CompanyNotFoundError } from "../../../domain/company/errors/CompanyNotFoundError";

export class GetCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(id: string): Promise<CompanyDTO | Error> {
    const company = await this.companyRepository.findById(id);
    
    if (!company) {
      return new CompanyNotFoundError();
    }

    return {
      id: company.id,
      name: company.name,
      address: company.address,
      userId: company.userId,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }
}
