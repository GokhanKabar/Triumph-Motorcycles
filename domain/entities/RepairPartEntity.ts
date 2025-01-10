import { Part } from "./PartEntity";
import { Repair } from "./RepairEntity";

export class RepairPart {
    constructor(
        public readonly id: string,
        public readonly repairId: Repair,
        public readonly partId: Part
    ) {}

}