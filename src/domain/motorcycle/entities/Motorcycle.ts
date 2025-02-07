import { v4 as uuidv4 } from "uuid";
import { MotorcycleValidationError } from "../errors/MotorcycleValidationError";
import { InvalidVinError } from "../errors/InvalidVinError";
import { InvalidMileageError } from "../errors/InvalidMileageError";
import { MissingRequiredFieldError } from "../../errors/MissingRequiredFieldError";
import { MotorcycleStatus } from "../enums/MotorcycleStatus";

export default class Motorcycle {
  private constructor(
    public readonly id: string,
    public readonly brand: string,
    public readonly model: string,
    public readonly year: number,
    public readonly vin: string,
    public readonly mileage: number,
    public readonly status: MotorcycleStatus,
    public readonly concessionId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static from(
    id: string | undefined,
    brand: string,
    model: string,
    year: number,
    vin: string,
    mileage: number,
    status: MotorcycleStatus,
    concessionId: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    if (!brand || !model) {
      return new MissingRequiredFieldError();
    }

    if (!vin) {
      return new MissingRequiredFieldError();
    }

    // Validation du VIN (17 caractères)
    if (vin.length !== 17) {
      return new InvalidVinError();
    }

    // Validation du kilométrage
    if (mileage < 0) {
      return new InvalidMileageError();
    }

    if (!concessionId) {
      return new MissingRequiredFieldError();
    }

    // Validation de l'année
    const currentYear = new Date().getFullYear();
    if (!year || year < 1990 || year > currentYear) {
      year = currentYear;
    }

    // Validation du statut
    if (!status) {
      status = MotorcycleStatus.AVAILABLE;
    }

    return new Motorcycle(
      id || uuidv4(),
      brand,
      model,
      year,
      vin,
      mileage,
      status,
      concessionId,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }
}
