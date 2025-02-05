import { IMotorcycleRepository } from "../../../domain/motorcycle/repositories/IMotorcycleRepository";
import Motorcycle from "../../../domain/motorcycle/entities/Motorcycle";
import { MotorcycleNotFoundError } from "../../../domain/motorcycle/errors/MotorcycleNotFoundError";

export class UpdateMotorcycleUseCase {
  constructor(private readonly motorcycleRepository: IMotorcycleRepository) {}

  async execute(
    id: string,
    brand: string,
    model: string,
    vin: string,
    currentMileage: number,
    concessionId: string
  ): Promise<Motorcycle | Error> {
    const existingMotorcycle = await this.motorcycleRepository.findById(id);
    
    if (!existingMotorcycle) {
      return new MotorcycleNotFoundError();
    }

    const updatedMotorcycle = Motorcycle.from(
      id,
      brand,
      model,
      vin,
      currentMileage,
      concessionId,
      existingMotorcycle.createdAt,
      new Date()
    );

    if (updatedMotorcycle instanceof Error) {
      return updatedMotorcycle;
    }

    await this.motorcycleRepository.update(updatedMotorcycle);
    return updatedMotorcycle;
  }
}
