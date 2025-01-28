import { Concession } from "./ConcessionEntity";
import { Incident } from "./IncidentEntity";
import { Maintenance } from "./MaintenanceEntity";
import { Interval } from "./IntervalEntity";

export enum MotorcycleStatus {
  AVAILABLE = "AVAILABLE",
  IN_MAINTENANCE = "IN_MAINTENANCE",
  IN_REPAIR = "IN_REPAIR",
  IN_USE = "IN_USE",
}

export class Motorcycle {
  constructor(
    public readonly id: string,
    public readonly brand: string,
    public readonly model: string,
    public readonly vin: string,
    public readonly concessionId: Concession,
    private _currentMileage: number,
    private _status: MotorcycleStatus = MotorcycleStatus.AVAILABLE,
    private _maintenances: Maintenance[] = [],
    private _incidents: Incident[] = []
  ) {}
  get currentMileage(): number {
    return this._currentMileage;
  }

  get status(): MotorcycleStatus {
    return this._status;
  }

  get maintenances(): ReadonlyArray<Maintenance> {
    return this._maintenances;
  }

  get incidents(): ReadonlyArray<Incident> {
    return this._incidents;
  }

  updateMileage(newMileage: number): void {
    if (newMileage < this._currentMileage) {
      throw new Error("New mileage cannot be less than current mileage");
    }
    this._currentMileage = newMileage;
  }

  setStatus(status: MotorcycleStatus): void {
    this._status = status;
  }

  addMaintenance(maintenance: Maintenance): void {
    this._maintenances.push(maintenance);
    this.setStatus(MotorcycleStatus.IN_MAINTENANCE);
  }

  addIncident(incident: Incident): void {
    this._incidents.push(incident);
    this.setStatus(MotorcycleStatus.IN_REPAIR);
  }

  needsMaintenance(maintenanceIntervals: Interval[]): boolean {
    return maintenanceIntervals.some((interval) => {
      return this._currentMileage >= interval.mileage;
    });
  }
}
