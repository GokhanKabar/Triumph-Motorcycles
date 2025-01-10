import { Motorcycle } from "./MotorcycleEntity";

export class Warranty {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: Motorcycle
    ) {}

}