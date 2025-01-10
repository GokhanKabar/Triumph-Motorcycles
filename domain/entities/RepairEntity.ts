import { Incident } from "./IncidentEntity";

export class Repair {
    constructor(
        public readonly id: string,
        public readonly incidentId: Incident
    ) {}

}