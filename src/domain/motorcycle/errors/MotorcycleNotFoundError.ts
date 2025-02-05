export class MotorcycleNotFoundError extends Error {
  constructor() {
    super('Motorcycle not found');
    this.name = 'MotorcycleNotFoundError';
  }
}
