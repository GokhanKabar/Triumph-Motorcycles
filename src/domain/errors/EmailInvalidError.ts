export class EmailInvalidError extends Error {
  constructor() {
    super('The email format is invalid');
    this.name = 'EmailInvalidError';
  }
}
