import { ICompanyMotorcycleRepository } from "../../../domain/companyMotorcycle/repositories/ICompanyMotorcycleRepository";
import { IMotorcycleRepository } from "../../../domain/motorcycle/repositories/IMotorcycleRepository";
import { CompanyMotorcycleDTO } from "../dtos/CompanyMotorcycleDTO";
import { CompanyNotFoundError } from "../../../domain/company/errors/CompanyNotFoundError";
import { ICompanyRepository } from "../../../domain/company/repositories/ICompanyRepository";

export class GetCompanyMotorcyclesUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly motorcycleRepository: IMotorcycleRepository,
    private readonly companyMotorcycleRepository: ICompanyMotorcycleRepository
  ) {}

  async execute(companyId: string): Promise<CompanyMotorcycleDTO[]> {
    try {
      // Vérifier si l'entreprise existe
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        return [];
      }

      // Récupérer toutes les relations pour cette entreprise
      const companyMotorcycles =
        await this.companyMotorcycleRepository.findByCompanyId(companyId);

      // Si aucune moto n'est trouvée, retourner un tableau vide
      if (!companyMotorcycles || companyMotorcycles.length === 0) {
        return [];
      }

      // Récupérer les détails de toutes les motos
      const motorcycleIds = companyMotorcycles.map(cm => cm.motorcycleId);
      const motorcycles = await Promise.all(
        motorcycleIds.map(id => this.motorcycleRepository.findById(id))
      );

      // Créer un map pour un accès rapide aux détails des motos
      const motorcycleDetails = motorcycles.reduce((acc, motorcycle) => {
        if (motorcycle) {
          acc[motorcycle.id] = motorcycle;
        }
        return acc;
      }, {} as Record<string, any>);

      // Transformer en DTOs avec les détails des motos
      return companyMotorcycles.map((cm) => ({
        id: cm.id,
        companyId: cm.companyId,
        motorcycleId: cm.motorcycleId,
        motorcycle: motorcycleDetails[cm.motorcycleId] ? {
          brand: motorcycleDetails[cm.motorcycleId].brand,
          model: motorcycleDetails[cm.motorcycleId].model,
          year: motorcycleDetails[cm.motorcycleId].year
        } : null,
        createdAt: cm.createdAt,
        updatedAt: cm.updatedAt,
      }));
    } catch (error) {
      throw error;
    }
  }
}
