import { v4 as uuidv4 } from 'uuid';
import { MotorcycleValidationError } from '../errors/MotorcycleValidationError';
import { InvalidVinError } from '../errors/InvalidVinError';
import { InvalidMileageError } from '../errors/InvalidMileageError';
import { MissingRequiredFieldError } from '../../errors/MissingRequiredFieldError';

export default class Motorcycle {
  private constructor(
    public readonly id: string,
    public readonly brand: string,
    public readonly model: string,
    public readonly vin: string,
    public readonly currentMileage: number,
    public readonly concessionId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static from(
    id: string | undefined,
    brand: string,
    model: string,
    vin: string,
    currentMileage: number,
    concessionId: string,
    createdAt?: Date,
    updatedAt?: Date,
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
    if (currentMileage < 0) {
      return new InvalidMileageError();
    }

    if (!concessionId) {
      return new MissingRequiredFieldError();
    }

    return new Motorcycle(
      id || uuidv4(),
      brand,
      model,
      vin,
      currentMileage,
      concessionId,
      createdAt || new Date(),
      updatedAt || new Date(),
    );
  }
}
