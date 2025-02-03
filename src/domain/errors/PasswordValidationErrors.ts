export class PasswordTooShortError extends Error {
  public override readonly name = "PasswordTooShortError";
}

export class PasswordDoesNotIncludeUppercaseLetterError extends Error {
  public override readonly name = "PasswordDoesNotIncludeUppercaseLetterError";
}

export class PasswordDoesNotIncludeLowercaseLetterError extends Error {
  public override readonly name = "PasswordDoesNotIncludeLowercaseLetterError";
}

export class PasswordDoesNotIncludeNumberError extends Error {
  public override readonly name = "PasswordDoesNotIncludeNumberError";
}

export class PasswordDoesNotIncludeSymbolError extends Error {
  public override readonly name = "PasswordDoesNotIncludeSymbolError";
}
