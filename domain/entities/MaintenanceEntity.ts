import { Motorcycle } from "./MotorcycleEntity";

export class Maintenance {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: Motorcycle
    ) {}

}