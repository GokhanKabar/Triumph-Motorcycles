import { Motorcycle } from "./MotorcycleEntity";
import { Repair } from "./RepairEntity";

export class Incident {
  constructor(
    public readonly id: string,
    public readonly motorcycleId: Motorcycle,
    public readonly date: Date,
    public readonly description: string,
    private _repairs: Repair[] = []
  ) {}
  get repairs(): ReadonlyArray<Repair> {
    return this._repairs;
  }

  addRepair(repair: Repair): void {
    this._repairs.push(repair);
  }
}
