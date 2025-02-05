export class ConcessionNotFoundError extends Error {
  constructor() {
    super("Concession not found");
    this.name = "ConcessionNotFoundError";
  }
}
