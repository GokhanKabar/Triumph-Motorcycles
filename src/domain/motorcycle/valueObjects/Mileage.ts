import { InvalidMileageError } from "../errors/InvalidMileageError";

export class Mileage {
  private constructor(private readonly value: number) {}

  public static from(value: number): Mileage | Error {
    if (value < 0) {
      return new InvalidMileageError();
    }

    return new Mileage(value);
  }

  public getValue(): number {
    return this.value;
  }
}
