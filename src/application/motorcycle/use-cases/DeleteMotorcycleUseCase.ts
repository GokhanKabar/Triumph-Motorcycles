import { IMotorcycleRepository } from "../../../domain/motorcycle/repositories/IMotorcycleRepository";
import { MotorcycleNotFoundError } from "../../../domain/motorcycle/errors/MotorcycleNotFoundError";

export class DeleteMotorcycleUseCase {
  constructor(private readonly motorcycleRepository: IMotorcycleRepository) {}

  async execute(id: string): Promise<void | Error> {
    const motorcycle = await this.motorcycleRepository.findById(id);
    
    if (!motorcycle) {
      return new MotorcycleNotFoundError();
    }

    await this.motorcycleRepository.delete(id);
  }
}
