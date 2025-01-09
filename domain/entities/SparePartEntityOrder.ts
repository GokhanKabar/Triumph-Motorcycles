export class SparePartOrder {
    constructor(
        public readonly id: string,
        public readonly sparePartId: string,
        public readonly quantity: number,
        public readonly orderDate: Date,
        public readonly deliveryDate: Date,
        public readonly cost: number
    ) {}
}
