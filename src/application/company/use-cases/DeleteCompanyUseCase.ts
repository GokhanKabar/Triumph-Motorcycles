import { ICompanyRepository } from "../../../domain/company/repositories/ICompanyRepository";
import { CompanyNotFoundError } from "../../../domain/company/errors/CompanyNotFoundError";

import { CompanyHasMotorcyclesError } from "../../../domain/company/errors/CompanyHasMotorcyclesError";

export class DeleteCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(id: string): Promise<void | Error> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      return new CompanyNotFoundError();
    }

    try {
      // Check for associated motorcycles before deletion
      const motorcycles = await this.companyRepository.getCompanyMotorcycles(
        id
      );
      if (motorcycles && motorcycles.length > 0) {
        return new CompanyHasMotorcyclesError();
      }

      await this.companyRepository.delete(id);
    } catch (error) {
      if (error instanceof CompanyHasMotorcyclesError) {
        return error;
      }
      throw error;
    }
  }
}
