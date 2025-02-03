import { Request, Response, NextFunction } from 'express';
import { EmailInvalidError } from '../../../domain/errors/EmailInvalidError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';
import { InvalidCredentialsError } from '../../../domain/errors/InvalidCredentialsError';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';
import { UserAlreadyExistsError } from '../../../domain/errors/UserAlreadyExistsError';
import { MissingRequiredFieldError } from '../../../domain/errors/MissingRequiredFieldError';
import { 
  NameTooShortError, 
  NameTooLongError, 
  NameContainsInvalidCharactersError 
} from '../../../domain/errors/NameValidationErrors';
import {
  PasswordTooShortError,
  PasswordDoesNotIncludeUppercaseLetterError,
  PasswordDoesNotIncludeLowercaseLetterError,
  PasswordDoesNotIncludeNumberError,
  PasswordDoesNotIncludeSymbolError
} from '../../../domain/errors/PasswordValidationErrors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Erreurs de validation du nom
  if (error instanceof NameTooShortError || 
      error instanceof NameTooLongError || 
      error instanceof NameContainsInvalidCharactersError) {
    return res.status(400).json({
      type: 'NameValidationError',
      message: error.message
    });
  }

  // Erreurs de validation du mot de passe
  if (error instanceof PasswordTooShortError ||
      error instanceof PasswordDoesNotIncludeUppercaseLetterError ||
      error instanceof PasswordDoesNotIncludeLowercaseLetterError ||
      error instanceof PasswordDoesNotIncludeNumberError ||
      error instanceof PasswordDoesNotIncludeSymbolError) {
    return res.status(400).json({
      type: 'PasswordValidationError',
      message: error.message
    });
  }

  // Erreur d'email invalide
  if (error instanceof EmailInvalidError) {
    return res.status(400).json({
      type: 'EmailValidationError',
      message: error.message
    });
  }

  // Erreur de champ requis manquant
  if (error instanceof MissingRequiredFieldError) {
    return res.status(400).json({
      type: 'ValidationError',
      message: error.message
    });
  }

  // Erreurs d'authentification
  if (error instanceof UnauthorizedError || 
      error instanceof InvalidCredentialsError) {
    return res.status(401).json({
      type: 'AuthenticationError',
      message: error.message
    });
  }

  // Erreurs liées aux utilisateurs
  if (error instanceof UserNotFoundError) {
    return res.status(404).json({
      type: 'NotFoundError',
      message: error.message
    });
  }

  if (error instanceof UserAlreadyExistsError) {
    return res.status(409).json({
      type: 'ConflictError',
      message: error.message
    });
  }

  // Erreur par défaut
  return res.status(500).json({
    type: 'InternalServerError',
    message: 'Une erreur interne est survenue'
  });
};
