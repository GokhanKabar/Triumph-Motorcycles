import { ICompanyMotorcycleRepository } from "../../../domain/companyMotorcycle/repositories/ICompanyMotorcycleRepository";
import { CompanyMotorcycleNotFoundError } from "../../../domain/companyMotorcycle/errors/CompanyMotorcycleNotFoundError";

export class RemoveMotorcycleFromCompanyUseCase {
    constructor(
        private readonly companyMotorcycleRepository: ICompanyMotorcycleRepository
    ) {}

    async execute(companyId: string, motorcycleId: string): Promise<void> {
        // Vérifier si la relation existe
        const companyMotorcycle = await this.companyMotorcycleRepository.findByCompanyAndMotorcycleId(
            companyId,
            motorcycleId
        );

        if (!companyMotorcycle) {
            throw new CompanyMotorcycleNotFoundError(companyId, motorcycleId);
        }

        // Supprimer la relation
        await this.companyMotorcycleRepository.delete(companyMotorcycle);
    }
}
