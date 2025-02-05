import { CompanyValidationError } from "../errors/CompanyValidationError";

export class CompanyName {
  private constructor(private readonly value: string) {}

  public static from(value: string): CompanyName | Error {
    if (!value || value.trim().length < 2) {
      return new CompanyValidationError('Company name must be at least 2 characters long');
    }

    return new CompanyName(value.trim());
  }

  public getValue(): string {
    return this.value;
  }
}
