export class PartOrderValidationError extends Error {
    public readonly type: 'VALIDATION_ERROR';
    public readonly details: Record<string, string>;
    constructor(
        message: string,
        details: Record<string, string> = {}
    ) {
        super(message);
        this.name = 'PartOrderValidationError';
        this.type = 'VALIDATION_ERROR';
        this.details = details;
        Object.setPrototypeOf(this, PartOrderValidationError.prototype);
    }
    static isPartOrderValidationError(error: unknown): error is PartOrderValidationError {
        return error instanceof PartOrderValidationError;
    }
}

export class PartOrderNotFoundError extends Error {
    public readonly type: 'NOT_FOUND_ERROR';
    constructor(id: string) {
        super(`Part order with ID ${id} not found`);
        this.name = 'PartOrderNotFoundError';
        this.type = 'NOT_FOUND_ERROR';
        Object.setPrototypeOf(this, PartOrderNotFoundError.prototype);
    }
}

export class PartOrderDuplicateError extends Error {
    public readonly type: 'DUPLICATE_ERROR';
    constructor(concessionId: string, inventoryPartId: string) {
        super(`Part order already exists for concession ${concessionId} for part ${inventoryPartId}`);
        this.name = 'PartOrderDuplicateError';
        this.type = 'DUPLICATE_ERROR';
        Object.setPrototypeOf(this, PartOrderDuplicateError.prototype);
    }
}