import { ICompanyRepository } from "../../../domain/company/repositories/ICompanyRepository";
import { IMotorcycleRepository } from "../../../domain/motorcycle/repositories/IMotorcycleRepository";
import { ICompanyMotorcycleRepository } from "../../../domain/companyMotorcycle/repositories/ICompanyMotorcycleRepository";
import { CompanyMotorcycle } from "../../../domain/companyMotorcycle/entities/CompanyMotorcycle";
import { CreateCompanyMotorcycleDTO } from "../dtos/CompanyMotorcycleDTO";
import { CompanyNotFoundError } from "../../../domain/company/errors/CompanyNotFoundError";
import { MotorcycleNotFoundError } from "../../../domain/motorcycle/errors/MotorcycleNotFoundError";

export class AssignMotorcycleToCompanyUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly motorcycleRepository: IMotorcycleRepository,
    private readonly companyMotorcycleRepository: ICompanyMotorcycleRepository
  ) {}

  async execute(dto: CreateCompanyMotorcycleDTO): Promise<void> {
    try {
      // Vérifier si l'entreprise existe
      const company = await this.companyRepository.findById(dto.companyId);
      if (!company) {
        throw new CompanyNotFoundError(dto.companyId);
      }

      // Vérifier si la moto existe
      const motorcycle = await this.motorcycleRepository.findById(
        dto.motorcycleId
      );
      if (!motorcycle) {
        throw new MotorcycleNotFoundError(dto.motorcycleId);
      }

      // Vérifier si la moto n'est pas déjà assignée à cette entreprise
      const existingAssignment =
        await this.companyMotorcycleRepository.findByCompanyAndMotorcycleId(
          dto.companyId,
          dto.motorcycleId
        );

      if (existingAssignment) {
        return; // La moto est déjà assignée, on ne fait rien
      }

      // Créer la relation
      const companyMotorcycle = CompanyMotorcycle.create({
        companyId: dto.companyId,
        motorcycleId: dto.motorcycleId,
      });

      // Sauvegarder la relation
      await this.companyMotorcycleRepository.save(companyMotorcycle);

      // Mettre à jour le statut de la moto à RESERVED
      motorcycle.status = "RESERVED";
      await this.motorcycleRepository.update(motorcycle);
    } catch (error) {
      throw error;
    }
  }
}
