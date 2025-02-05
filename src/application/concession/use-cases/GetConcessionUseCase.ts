import { IConcessionRepository } from "../../../domain/concession/repositories/IConcessionRepository";
import { ConcessionDTO } from "../dtos/ConcessionDTO";
import { ConcessionNotFoundError } from "../../../domain/concession/errors/ConcessionNotFoundError";

export class GetConcessionUseCase {
  constructor(private readonly concessionRepository: IConcessionRepository) {}

  async execute(id: string): Promise<ConcessionDTO | Error> {
    const concession = await this.concessionRepository.findById(id);
    
    if (!concession) {
      return new ConcessionNotFoundError();
    }

    return {
      id: concession.id,
      name: concession.name,
      address: concession.address,
      userId: concession.userId,
      createdAt: concession.createdAt,
      updatedAt: concession.updatedAt
    };
  }
}
