import { IIncidentRepository } from "@/domain/incident/repositories/IIncidentRepository";

export class DeleteIncidentUseCase {
  constructor(
    private readonly incidentRepository: IIncidentRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    return await this.incidentRepository.delete(id);
  }
}
