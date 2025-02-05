export class InvalidVinError extends Error {
  constructor() {
    super('Invalid VIN format');
    this.name = 'InvalidVinError';
  }
}
