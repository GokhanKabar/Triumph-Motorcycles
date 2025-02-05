import { IMotorcycleRepository } from "../../../domain/motorcycle/repositories/IMotorcycleRepository";
import { MotorcycleDTO } from "../dtos/MotorcycleDTO";
import { MotorcycleNotFoundError } from "../../../domain/motorcycle/errors/MotorcycleNotFoundError";

export class GetMotorcycleUseCase {
  constructor(private readonly motorcycleRepository: IMotorcycleRepository) {}

  async execute(id: string): Promise<MotorcycleDTO | Error> {
    const motorcycle = await this.motorcycleRepository.findById(id);
    
    if (!motorcycle) {
      return new MotorcycleNotFoundError();
    }

    return {
      id: motorcycle.id,
      brand: motorcycle.brand,
      model: motorcycle.model,
      vin: motorcycle.vin,
      currentMileage: motorcycle.currentMileage,
      concessionId: motorcycle.concessionId,
      createdAt: motorcycle.createdAt,
      updatedAt: motorcycle.updatedAt
    };
  }
}
