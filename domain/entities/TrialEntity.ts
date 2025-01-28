import { Client } from "./ClientEntity";
import { Motorcycle } from "./MotorcycleEntity";

export enum TrialStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
export class Trial {
  constructor(
    public readonly id: string,
    public readonly motorcycleId: Motorcycle,
    public readonly clientId: Client,
    public readonly startDate: Date,
    public readonly endDate: Date,
    private _status: TrialStatus = TrialStatus.SCHEDULED
  ) {
    this.validateDates(startDate, endDate);
  }
  private validateDates(start: Date, end: Date): void {
    if (end <= start) {
      throw new Error("End date must be after start date");
    }
  }

  get status(): TrialStatus {
    return this._status;
  }

  start(): void {
    if (this._status !== TrialStatus.SCHEDULED) {
      throw new Error("Trial must be scheduled to start");
    }
    this._status = TrialStatus.IN_PROGRESS;
  }

  complete(feedback: string): void {
    if (this._status !== TrialStatus.IN_PROGRESS) {
      throw new Error("Trial must be in progress to complete");
    }
    this._status = TrialStatus.COMPLETED;
  }

  cancel(): void {
    if (this._status === TrialStatus.COMPLETED) {
      throw new Error("Cannot cancel completed trial");
    }
    this._status = TrialStatus.CANCELLED;
  }
}
