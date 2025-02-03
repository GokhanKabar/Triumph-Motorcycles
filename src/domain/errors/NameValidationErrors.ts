export class NameTooShortError extends Error {
  public override readonly name = "NameTooShortError";
}

export class NameTooLongError extends Error {
  public override readonly name = "NameTooLongError";
}

export class NameContainsInvalidCharactersError extends Error {
  public override readonly name = "NameContainsInvalidCharactersError";
}
