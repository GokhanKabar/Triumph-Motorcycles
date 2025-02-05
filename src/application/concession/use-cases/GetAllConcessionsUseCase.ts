import { IConcessionRepository } from "../../../domain/concession/repositories/IConcessionRepository";
import { ConcessionDTO } from "../dtos/ConcessionDTO";

export class GetAllConcessionsUseCase {
  constructor(private readonly concessionRepository: IConcessionRepository) {}

  async execute(): Promise<ConcessionDTO[]> {
    const concessions = await this.concessionRepository.findAll();
    return concessions.map(concession => ({
      id: concession.id,
      name: concession.name,
      address: concession.address,
      userId: concession.userId,
      createdAt: concession.createdAt,
      updatedAt: concession.updatedAt
    }));
  }
}
