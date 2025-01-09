export class Motorcycle {
    constructor(
        public readonly id: string,
        public readonly model: string,
        public readonly registrationNumber: string,
        public readonly mileage: number,
        public readonly status: "disponible" | "enMaintenance" | "enTest" | "horsService",
        public readonly partnerId: string,
        public readonly lastServiceDate: Date,
        public readonly nextServiceDue: { date: Date | null; mileage: number | null }
    ) {}

}