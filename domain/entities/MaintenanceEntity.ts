import { Motorcycle } from "./MotorcycleEntity";
import { MotorcyclePart } from "./MotorcyclePartEntity";

export class Maintenance {
  constructor(
    public readonly id: string,
    public readonly motorcycleId: Motorcycle,
    public readonly date: Date,
    public readonly description: string,
    public readonly cost: number,
    public readonly technicianNotes: string,
    private _parts: MotorcyclePart[] = []
  ) {}
  get parts(): ReadonlyArray<MotorcyclePart> {
    return this._parts;
  }

  addPart(part: MotorcyclePart): void {
    this._parts.push(part);
  }
}
