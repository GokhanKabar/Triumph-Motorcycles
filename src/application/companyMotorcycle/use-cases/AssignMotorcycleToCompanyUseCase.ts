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
        console.log('DEBUG - UseCase - Starting execution with:', dto);
        
        try {
            // Vérifier si l'entreprise existe
            console.log('DEBUG - UseCase - Checking company existence:', dto.companyId);
            const company = await this.companyRepository.findById(dto.companyId);
            if (!company) {
                console.log('DEBUG - UseCase - Company not found');
                throw new CompanyNotFoundError(dto.companyId);
            }
            console.log('DEBUG - UseCase - Company found:', company);

            // Vérifier si la moto existe
            console.log('DEBUG - UseCase - Checking motorcycle existence:', dto.motorcycleId);
            const motorcycle = await this.motorcycleRepository.findById(dto.motorcycleId);
            if (!motorcycle) {
                console.log('DEBUG - UseCase - Motorcycle not found');
                throw new MotorcycleNotFoundError(dto.motorcycleId);
            }
            console.log('DEBUG - UseCase - Motorcycle found:', motorcycle);

            // Vérifier si la moto n'est pas déjà assignée à cette entreprise
            console.log('DEBUG - UseCase - Checking existing assignment');
            const existingAssignment = await this.companyMotorcycleRepository.findByCompanyAndMotorcycleId(
                dto.companyId,
                dto.motorcycleId
            );
            
            if (existingAssignment) {
                console.log('DEBUG - UseCase - Assignment already exists');
                return; // La moto est déjà assignée, on ne fait rien
            }

            // Créer la relation
            console.log('DEBUG - UseCase - Creating new assignment');
            const companyMotorcycle = CompanyMotorcycle.create({
                companyId: dto.companyId,
                motorcycleId: dto.motorcycleId
            });

            // Sauvegarder la relation
            console.log('DEBUG - UseCase - Saving new assignment:', companyMotorcycle);
            await this.companyMotorcycleRepository.save(companyMotorcycle);
            console.log('DEBUG - UseCase - Assignment saved successfully');
            
        } catch (error) {
            console.error('DEBUG - UseCase - Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                dto: dto
            });
            throw error;
        }
    }
}
