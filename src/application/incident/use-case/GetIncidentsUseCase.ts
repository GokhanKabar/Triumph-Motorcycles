import { IIncidentRepository } from "@/domain/incident/repositories/IIncidentRepository";
import { IncidentDto } from "../dto/IncidentDto";
import { IncidentType } from "@domain/incident/enum/IncidentType";
import { IncidentStatus } from "@domain/incident/enum/IncidentStatus";

export class GetIncidentsUseCase {
  constructor(
    private readonly incidentRepository: IIncidentRepository
  ) {}

  async getByTestRideId(testRideId: string): Promise<IncidentDto[]> {
    const incidents = await this.incidentRepository.findByTestRideId(testRideId);
    return incidents.map(incident => ({
      id: incident.id,
      testRideId: incident.testRideId,
      type: incident.type,
      status: incident.status,
      description: incident.description,
      incidentDate: incident.incidentDate,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt
    }));
  }

  async getByType(type: IncidentType): Promise<IncidentDto[]> {
    const incidents = await this.incidentRepository.findByType(type);
    return incidents.map(incident => ({
      id: incident.id,
      testRideId: incident.testRideId,
      type: incident.type,
      status: incident.status,
      description: incident.description,
      incidentDate: incident.incidentDate,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt
    }));
  }

  async getByStatus(status: IncidentStatus): Promise<IncidentDto[]> {
    const incidents = await this.incidentRepository.findByStatus(status);
    return incidents.map(incident => ({
      id: incident.id,
      testRideId: incident.testRideId,
      type: incident.type,
      status: incident.status,
      description: incident.description,
      incidentDate: incident.incidentDate,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt
    }));
  }

  async getAll(): Promise<IncidentDto[]> {
    const incidents = await this.incidentRepository.findAll();
    return incidents.map(incident => ({
      id: incident.id,
      testRideId: incident.testRideId,
      type: incident.type,
      status: incident.status,
      description: incident.description,
      incidentDate: incident.incidentDate,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt
    }));
  }
}
