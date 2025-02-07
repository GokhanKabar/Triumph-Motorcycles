export class CompanyMotorcycleValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CompanyMotorcycleValidationError';
    }
}
