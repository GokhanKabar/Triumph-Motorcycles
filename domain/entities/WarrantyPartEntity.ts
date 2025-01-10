import { Part } from "./PartEntity";
import { Warranty } from "./WarrantyEntity";

export class WarrantyPart {
    constructor(
        public readonly id: string,
        public readonly warrantyId: Warranty,
        public readonly partId: Part
    ) {}

}