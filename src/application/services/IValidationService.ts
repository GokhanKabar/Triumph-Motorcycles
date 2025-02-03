export interface IValidationService {
  validate<T>(data: unknown, type: 'createUser' | 'updateUser' | 'login' | 'forgotPassword' | 'resetPassword'): Promise<T>;
}
