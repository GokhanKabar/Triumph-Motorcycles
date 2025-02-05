import { ICompanyRepository } from "../../../domain/company/repositories/ICompanyRepository";
import { CompanyNotFoundError } from "../../../domain/company/errors/CompanyNotFoundError";

export class DeleteCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(id: string): Promise<void | Error> {
    const company = await this.companyRepository.findById(id);
    
    if (!company) {
      return new CompanyNotFoundError();
    }

    await this.companyRepository.delete(id);
  }
}
