export class Trial {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: string,
        public readonly driverId: string,
        public readonly startDate: Date,
        public readonly endDate: Date | null,
        public readonly distanceCovered: number
    ) {}

}