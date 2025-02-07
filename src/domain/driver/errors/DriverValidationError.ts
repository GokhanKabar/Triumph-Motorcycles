export default class DriverValidationError extends Error {
  constructor(message: string = 'Driver validation error') {
    super(message);
    this.name = 'DriverValidationError';
  }
}
