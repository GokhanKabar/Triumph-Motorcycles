export class ConcessionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcessionValidationError';
  }
}
