import { Client } from "./ClientEntity";
import { Motorcycle } from "./MotorcycleEntity";

export class Trial {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: Motorcycle,
        public readonly clientId: Client
    ) {}

}