import {
  PasswordTooShortError,
  PasswordDoesNotIncludeUppercaseLetterError,
  PasswordDoesNotIncludeLowercaseLetterError,
  PasswordDoesNotIncludeNumberError,
  PasswordDoesNotIncludeSymbolError
} from "../../../domain/errors/PasswordValidationErrors";
import { Value } from "../../../domain/core/Value";

export class Password implements Value<string> {
  private constructor(
    public readonly value: string,
  ) { }

  public static from(value: string): Password | Error {
    if (value.length < 8) {
      return new PasswordTooShortError();
    }

    if (!/[A-Z]/.test(value)) {
      return new PasswordDoesNotIncludeUppercaseLetterError();
    }

    if (!/[a-z]/.test(value)) {
      return new PasswordDoesNotIncludeLowercaseLetterError();
    }

    if (!/[0-9]/.test(value)) {
      return new PasswordDoesNotIncludeNumberError();
    }

    if (!/[!@#$%^&*]/.test(value)) {
      return new PasswordDoesNotIncludeSymbolError();
    }

    return new Password(value);
  }

  public equals(other: Password): boolean {
    return this.value === other.value;
  }
}
