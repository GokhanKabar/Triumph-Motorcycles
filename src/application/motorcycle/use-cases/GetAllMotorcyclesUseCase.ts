import { IMotorcycleRepository } from "../../../domain/motorcycle/repositories/IMotorcycleRepository";
import { MotorcycleDTO, MotorcycleStatus } from "../dtos/MotorcycleDTO";

export class GetAllMotorcyclesUseCase {
  constructor(private readonly motorcycleRepository: IMotorcycleRepository) {}

  async execute(): Promise<MotorcycleDTO[]> {
    const motorcycles = await this.motorcycleRepository.findAll();
    return motorcycles.map(motorcycle => {

      return {
        id: motorcycle.id,
        brand: motorcycle.brand,
        model: motorcycle.model,
        vin: motorcycle.vin,
        currentMileage: motorcycle.currentMileage,
        status: motorcycle.status || MotorcycleStatus.AVAILABLE,
        concessionId: motorcycle.concessionId,
        createdAt: motorcycle.createdAt,
        updatedAt: motorcycle.updatedAt
      };
    });
  }
}
