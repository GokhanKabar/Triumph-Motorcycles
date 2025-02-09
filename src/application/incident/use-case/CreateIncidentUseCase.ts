import { Incident } from "@domain/incident/entities/Incident";
import { IIncidentRepository } from "@/domain/incident/repositories/IIncidentRepository";
import { ITestRideRepository } from "@domain/testRide/repository/ITestRideRepository";
import { IncidentType } from "@domain/incident/enum/IncidentType";
import { IncidentDto } from "../dto/IncidentDto";

export class CreateIncidentUseCase {
  constructor(
    private readonly incidentRepository: IIncidentRepository,
    private readonly testRideRepository: ITestRideRepository
  ) {}

  async execute(
    testRideId: string, 
    type: IncidentType, 
    description: string, 
    incidentDate: Date
  ): Promise<IncidentDto | Error> {
    // Vérifier que le test ride existe
    const testRide = await this.testRideRepository.findById(testRideId);
    if (!testRide) {
      return new Error('Test ride non trouvé');
    }

    // Créer l'incident
    const incidentOrError = Incident.create(
      testRideId, 
      type, 
      description, 
      incidentDate
    );

    if (incidentOrError instanceof Error) {
      return incidentOrError;
    }

    // Sauvegarder l'incident
    const savedIncident = await this.incidentRepository.save(incidentOrError);

    // Convertir en DTO
    return {
      id: savedIncident.id,
      testRideId: savedIncident.testRideId,
      type: savedIncident.type,
      status: savedIncident.status,
      description: savedIncident.description,
      incidentDate: savedIncident.incidentDate,
      createdAt: savedIncident.createdAt,
      updatedAt: savedIncident.updatedAt
    };
  }
}
