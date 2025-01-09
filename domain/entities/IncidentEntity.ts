export class Incident {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: string,
        public readonly driverId: string | null,
        public readonly date: Date,
        public readonly description: string,
        public readonly type: "accident" | "infraction" | "autre"
    ) {}
}
