import { Incident } from "./IncidentEntity";

export class Driver {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly licenseNumber: string,
        public readonly experienceLevel: "beginner" | "intermediate" | "expert",
        public readonly motorcycleId: string | null,
        public readonly incidentHistory: Incident[]
    ) {}

}