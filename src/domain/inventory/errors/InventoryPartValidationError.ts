export class InventoryPartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryPartValidationError';
  }
}
