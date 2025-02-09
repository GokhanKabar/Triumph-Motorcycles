export class TestRideValidationError extends Error {
  public readonly type: 'VALIDATION_ERROR';
  public readonly details: Record<string, string>;

  constructor(
    message: string, 
    details: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'TestRideValidationError';
    this.type = 'VALIDATION_ERROR';
    this.details = details;

    // Nécessaire pour les erreurs personnalisées dans TypeScript
    Object.setPrototypeOf(this, TestRideValidationError.prototype);
  }

  static isTestRideValidationError(error: unknown): error is TestRideValidationError {
    return error instanceof TestRideValidationError;
  }
}

export class TestRideNotFoundError extends Error {
  public readonly type: 'NOT_FOUND_ERROR';

  constructor(id: string) {
    super(`Test ride with ID ${id} not found`);
    this.name = 'TestRideNotFoundError';
    this.type = 'NOT_FOUND_ERROR';

    Object.setPrototypeOf(this, TestRideNotFoundError.prototype);
  }
}

export class TestRideDuplicateError extends Error {
  public readonly type: 'DUPLICATE_ERROR';

  constructor(concessionId: string, motorcycleId: string, desiredDate: Date) {
    super(`Test ride already exists for concession ${concessionId}, motorcycle ${motorcycleId} on ${desiredDate}`);
    this.name = 'TestRideDuplicateError';
    this.type = 'DUPLICATE_ERROR';

    Object.setPrototypeOf(this, TestRideDuplicateError.prototype);
  }
}
