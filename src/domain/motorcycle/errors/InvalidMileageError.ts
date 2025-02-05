export class InvalidMileageError extends Error {
  constructor() {
    super('Invalid mileage value');
    this.name = 'InvalidMileageError';
  }
}
