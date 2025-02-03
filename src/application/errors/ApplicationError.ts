export abstract class ApplicationError extends Error {
  public readonly code: number;
  public readonly isOperational: boolean;

  constructor(
    message: string, 
    code: number = 500, 
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = isOperational;

    // Maintient la stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Not authorized') {
    super(message, 403);
  }
}

export class ResourceNotFoundError extends ApplicationError {
  constructor(resourceName: string, identifier?: string) {
    const message = identifier 
      ? `${resourceName} not found with identifier: ${identifier}` 
      : `${resourceName} not found`;
    super(message, 404);
  }
}

export class UserNotFoundError extends ResourceNotFoundError {
  constructor(identifier?: string) {
    super('User', identifier);
  }
}

export class UserAlreadyExistsError extends ValidationError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor() {
    super('Invalid email or password');
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, false);
  }
}
