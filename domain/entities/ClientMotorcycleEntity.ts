import { Motorcycle } from "./MotorcycleEntity";
import { Client } from "./ClientEntity";

export class ClientMotorcycle {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: Motorcycle,
        public readonly clientId: Client
    ) {}

}