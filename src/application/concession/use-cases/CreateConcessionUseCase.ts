import Concession from "../../../domain/concession/entities/Concession";
import { IConcessionRepository } from "../../../domain/concession/repositories/IConcessionRepository";

export class CreateConcessionUseCase {
  constructor(private readonly concessionRepository: IConcessionRepository) {}

  async execute(
    name: string,
    address: string,
    userId: string
  ): Promise<Concession | Error> {
    const concession = Concession.from(undefined, userId, name, address);

    if (concession instanceof Error) {
      return concession;
    }

    await this.concessionRepository.save(concession);
    return concession;
  }
}
