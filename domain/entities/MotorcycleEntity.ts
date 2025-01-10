import { Concession } from "./ConcessionEntity";

export class Motorcycle {
    constructor(
        public readonly id: string,
        public readonly brand: string,
        public readonly model: string,
        public readonly vin: string,
        public readonly concessionId: Concession
    ) {}

}