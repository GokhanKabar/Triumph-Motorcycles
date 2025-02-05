import { ICompanyRepository } from "../../../domain/company/repositories/ICompanyRepository";
import Company from "../../../domain/company/entities/Company";
import { CompanyNotFoundError } from "../../../domain/company/errors/CompanyNotFoundError";

export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(
    id: string,
    name: string,
    address: string,
    userId: string
  ): Promise<Company | Error> {
    const existingCompany = await this.companyRepository.findById(id);
    
    if (!existingCompany) {
      return new CompanyNotFoundError();
    }

    const updatedCompany = Company.from(
      id,
      name,
      address,
      userId,
      existingCompany.createdAt,
      new Date()
    );

    if (updatedCompany instanceof Error) {
      return updatedCompany;
    }

    await this.companyRepository.update(updatedCompany);
    return updatedCompany;
  }
}
