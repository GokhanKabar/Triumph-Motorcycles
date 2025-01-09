export class SparePart {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly stockQuantity: number,
        public readonly threshold: number,
        public readonly cost: number,
        public readonly lastOrderDate: Date | null
    ) {}

}
