export class ConcessionHasMotorcyclesError extends Error {
  constructor() {
    super('Cannot delete concession because it has associated motorcycles');
    this.name = 'ConcessionHasMotorcyclesError';
  }
}
