import { ConcessionValidationError } from "../errors/ConcessionValidationError";

export class ConcessionName {
  private constructor(private readonly value: string) {}

  public static from(value: string): ConcessionName | Error {
    if (!value || value.trim().length < 2) {
      return new ConcessionValidationError('Concession name must be at least 2 characters long');
    }

    return new ConcessionName(value.trim());
  }

  public getValue(): string {
    return this.value;
  }
}
