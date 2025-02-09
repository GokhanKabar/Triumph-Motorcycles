import { IConcessionRepository } from "../../../domain/concession/repositories/IConcessionRepository";
import { ConcessionNotFoundError } from "../../../domain/concession/errors/ConcessionNotFoundError";
import { ConcessionHasMotorcyclesError } from "../../../domain/concession/errors/ConcessionHasMotorcyclesError";

export class DeleteConcessionUseCase {
  constructor(private readonly concessionRepository: IConcessionRepository) {}

  async execute(id: string): Promise<void | Error> {
    try {
      const concession = await this.concessionRepository.findById(id);

      if (!concession) {
        return new ConcessionNotFoundError();
      }

      await this.concessionRepository.delete(id);
    } catch (error) {
      if (error instanceof ConcessionHasMotorcyclesError) {
        return error;
      }
      throw error;
    }
  }
}
