import { Motorcycle } from "./MotorcycleEntity";
import { Part } from "./PartEntity";

export class MotorcyclePart {
    constructor(
        public readonly id: string,
        public readonly partId: Part,
        public readonly motorcycleId: Motorcycle
    ) {}

}