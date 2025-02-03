import { NameTooShortError, NameTooLongError, NameContainsInvalidCharactersError } from "../../../domain/errors/NameValidationErrors";
import { Value } from "../../../domain/core/Value";

export class Name implements Value<string> {
  private constructor(
    public readonly value: string,
  ) { }

  public static from(value: string): Name | Error {
    const normalizedValue = value.trim();

    if (normalizedValue.length < 2) {
      return new NameTooShortError();
    }

    if (normalizedValue.length > 50) {
      return new NameTooLongError();
    }

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(normalizedValue)) {
      return new NameContainsInvalidCharactersError();
    }

    return new Name(normalizedValue);
  }

  public equals(other: Name): boolean {
    return this.value === other.value;
  }
}
