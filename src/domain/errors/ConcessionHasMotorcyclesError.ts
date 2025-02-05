export class ConcessionHasMotorcyclesError extends Error {
  constructor() {
    super("Impossible de supprimer la concession car elle possède des motos associées");
    this.name = "ConcessionHasMotorcyclesError";
  }
}
