import { IConcessionRepository } from "../../../domain/concession/repositories/IConcessionRepository";
import Concession from "../../../domain/concession/entities/Concession";
import { ConcessionNotFoundError } from "../../../domain/concession/errors/ConcessionNotFoundError";

export class UpdateConcessionUseCase {
  constructor(private readonly concessionRepository: IConcessionRepository) {}

  async execute(
    id: string,
    name: string,
    address: string,
    userId: string
  ): Promise<Concession | Error> {
    const existingConcession = await this.concessionRepository.findById(id);
    
    if (!existingConcession) {
      return new ConcessionNotFoundError();
    }

    const updatedConcession = Concession.from(
      id,
      name,
      address,
      userId,
      existingConcession.createdAt,
      new Date()
    );

    if (updatedConcession instanceof Error) {
      return updatedConcession;
    }

    await this.concessionRepository.update(updatedConcession);
    return updatedConcession;
  }
}
