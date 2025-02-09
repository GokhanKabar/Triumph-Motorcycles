import { IIncidentRepository } from "@/domain/incident/repositories/IIncidentRepository";
import { IncidentDto } from "../dto/IncidentDto";
import { IncidentType } from "@domain/incident/enum/IncidentType";
import { IncidentStatus } from "@domain/incident/enum/IncidentStatus";
import { Incident } from "@domain/incident/entities/Incident";

export class UpdateIncidentUseCase {
  constructor(
    private readonly incidentRepository: IIncidentRepository
  ) {}

  async execute(
    id: string,
    data: {
      type?: IncidentType;
      status?: IncidentStatus;
      description?: string;
      incidentDate?: Date;
    }
  ): Promise<IncidentDto | null> {
    const updatedIncident = await this.incidentRepository.update(id, data);

    if (!updatedIncident) {
      return null;
    }

    return {
      id: updatedIncident.id,
      testRideId: updatedIncident.testRideId,
      type: updatedIncident.type,
      status: updatedIncident.status,
      description: updatedIncident.description,
      incidentDate: updatedIncident.incidentDate,
      createdAt: updatedIncident.createdAt,
      updatedAt: updatedIncident.updatedAt
    };
  }
}
