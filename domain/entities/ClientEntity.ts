export class Client {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly contactDetails: { email: string; phone: string; address: string },
        public readonly fleetSize: number,
        public readonly type: "courier" | "rental" | "dealer"
    ) {}

}