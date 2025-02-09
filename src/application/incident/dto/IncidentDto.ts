import { IncidentType } from "@domain/incident/enum/IncidentType";
import { IncidentStatus } from "@domain/incident/enum/IncidentStatus";

export interface IncidentDto {
  id: string;
  testRideId: string;
  type: IncidentType;
  status: IncidentStatus;
  description: string;
  incidentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
