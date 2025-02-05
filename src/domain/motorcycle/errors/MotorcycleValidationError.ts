export class MotorcycleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MotorcycleValidationError';
  }
}
