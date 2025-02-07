import Motorcycle from "../../../domain/motorcycle/entities/Motorcycle";
import { IMotorcycleRepository } from "../../../domain/motorcycle/repositories/IMotorcycleRepository";

export class CreateMotorcycleUseCase {
  constructor(
    private readonly motorcycleRepository: IMotorcycleRepository,
  ) {}

  async execute(
    brand: string,
    model: string,
    vin: string,
    currentMileage: number,
    concessionId: string,
    year?: number
  ): Promise<Motorcycle | Error> {
    const motorcycle = Motorcycle.from(
      undefined,
      brand,
      model,
      vin,
      currentMileage,
      concessionId,
      year
    );

    if (motorcycle instanceof Error) {
      return motorcycle;
    }

    await this.motorcycleRepository.save(motorcycle);
    return motorcycle;
  }
}
