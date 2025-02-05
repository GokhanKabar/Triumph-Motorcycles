import { IConcessionRepository } from "../../../domain/concession/repositories/IConcessionRepository";
import { ConcessionNotFoundError } from "../../../domain/concession/errors/ConcessionNotFoundError";

export class DeleteConcessionUseCase {
  constructor(private readonly concessionRepository: IConcessionRepository) {}

  async execute(id: string): Promise<void | Error> {
    const concession = await this.concessionRepository.findById(id);
    
    if (!concession) {
      return new ConcessionNotFoundError();
    }

    await this.concessionRepository.delete(id);
  }
}
