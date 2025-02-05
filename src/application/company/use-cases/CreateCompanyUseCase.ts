import Company from "../../../domain/company/entities/Company";
import { ICompanyRepository } from "../../../domain/company/repositories/ICompanyRepository";

export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(
    name: string,
    address: string,
    userId: string
  ): Promise<Company | Error> {
    const company = Company.from(undefined, userId, name, address);

    if (company instanceof Error) {
      return company;
    }

    await this.companyRepository.save(company);
    return company;
  }
}
