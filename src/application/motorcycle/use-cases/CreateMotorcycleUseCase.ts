import Motorcycle from "../../../domain/motorcycle/entities/Motorcycle";
import { IMotorcycleRepository } from "../../../domain/motorcycle/repositories/IMotorcycleRepository";
import { MotorcycleStatus } from "../../../domain/motorcycle/enums/MotorcycleStatus";

export class CreateMotorcycleUseCase {
  constructor(
    private readonly motorcycleRepository: IMotorcycleRepository,
  ) {}

  async execute(
    brand: string,
    model: string,
    year: number,
    vin: string,
    mileage: number,
    status: MotorcycleStatus,
    concessionId: string
  ): Promise<Motorcycle | Error> {
    const motorcycle = Motorcycle.from(
      undefined,
      brand,
      model,
      year,
      vin,
      mileage,
      status,
      concessionId,
      undefined,
      undefined
    );

    if (motorcycle instanceof Error) {
      return motorcycle;
    }

    await this.motorcycleRepository.save(motorcycle);
    return motorcycle;
  }
}
