import { Maintenance } from "./MaintenanceEntity";
import { Motorcycle } from "./MotorcycleEntity";

export class Interval {
  constructor(
    public readonly id: string,
    public readonly mileage: number,
    public readonly motorcycleId: Motorcycle,
    public readonly maintenanceId: Maintenance
  ) {}
}
