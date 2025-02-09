export class CompanyHasMotorcyclesError extends Error {
  constructor() {
    super("Cette entreprise possède des motos associées");
    this.name = "CompanyHasMotorcyclesError";
  }
}
