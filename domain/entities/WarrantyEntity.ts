export class Warranty {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: string,
        public readonly sparePartId: string | null,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public readonly coverageDetails: string
    ) {}

}