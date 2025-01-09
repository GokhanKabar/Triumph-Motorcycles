export class Maintenance {
    constructor(
        public readonly id: string,
        public readonly motorcycleId: string,
        public readonly type: "preventive" | "curative",
        public readonly date: Date,
        public readonly mileageAtService: number,
        public readonly details: string,
        public readonly cost: number
    ) {}
}