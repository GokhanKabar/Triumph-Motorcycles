export class UserNotFoundError extends Error {
  public override readonly name = "UserNotFoundError";

  constructor(message: string = "Utilisateur non trouvé") {
    super(message);
  }
}
