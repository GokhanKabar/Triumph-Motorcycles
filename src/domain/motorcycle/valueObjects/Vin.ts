import { InvalidVinError } from "../errors/InvalidVinError";

export class Vin {
  private constructor(private readonly value: string) {}

  public static from(value: string): Vin | Error {
    if (!value || value.length !== 17) {
      return new InvalidVinError();
    }

    return new Vin(value);
  }

  public getValue(): string {
    return this.value;
  }
}
