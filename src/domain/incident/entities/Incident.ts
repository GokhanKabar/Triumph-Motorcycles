import { v4 as uuidv4 } from "uuid";
import { IncidentType } from "../enum/IncidentType";
import { IncidentStatus } from "../enum/IncidentStatus";
import { IncidentError } from "../error/IncidentError";

export class Incident {
  private constructor(
    public readonly id: string,
    public readonly testRideId: string,
    public readonly type: IncidentType,
    public readonly status: IncidentStatus,
    public readonly description: string,
    public readonly incidentDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(
    testRideId: string,
    type: IncidentType,
    description: string,
    incidentDate: Date,
    id?: string,
    status?: IncidentStatus,
    createdAt?: Date,
    updatedAt?: Date
  ): Incident {
    // Validation des données
    if (!testRideId) {
      throw new IncidentError("L'ID du test ride est requis");
    }

    if (!description) {
      throw new IncidentError("Une description est obligatoire");
    }

    if (incidentDate > new Date()) {
      throw new IncidentError("La date de l'incident ne peut pas être dans le futur");
    }

    return new Incident(
      id || uuidv4(),
      testRideId,
      type,
      status || IncidentStatus.REPORTED,
      description,
      incidentDate,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public updateStatus(newStatus: IncidentStatus): Incident {
    return new Incident(
      this.id,
      this.testRideId,
      this.type,
      newStatus,
      this.description,
      this.incidentDate,
      this.createdAt,
      new Date()
    );
  }

  public toJSON() {
    return {
      id: this.id,
      testRideId: this.testRideId,
      type: this.type,
      status: this.status,
      description: this.description,
      incidentDate: this.incidentDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
