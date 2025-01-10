import { Motorcycle } from "./MotorcycleEntity";

export class Incident {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: Motorcycle
    ) {}

}