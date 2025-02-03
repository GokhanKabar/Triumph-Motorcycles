import { EmailInvalidError } from "../../../domain/errors/EmailInvalidError";
import { Value } from "../../../domain/core/Value";

export class Email implements Value<string> {
  private constructor(
    public readonly value: string,
  ) { }

  public static from(value: string): Email | Error {
    const normalizedValue = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedValue)) {
      return new EmailInvalidError();
    }

    return new Email(normalizedValue);
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}
