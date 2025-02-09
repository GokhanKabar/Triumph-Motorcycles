import { Incident } from "../entities/Incident";
import { IncidentType } from "../enum/IncidentType";
import { IncidentStatus } from "../enum/IncidentStatus";

export interface IIncidentRepository {
  findAll(): Promise<Incident[]>;
  findById(id: string): Promise<Incident | null>;
  findByTestRideId(testRideId: string): Promise<Incident[]>;
  findByType(type: IncidentType): Promise<Incident[]>;
  findByStatus(status: IncidentStatus): Promise<Incident[]>;
  save(incident: Incident): Promise<Incident>;
  update(id: string, incident: Partial<Incident>): Promise<Incident | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
