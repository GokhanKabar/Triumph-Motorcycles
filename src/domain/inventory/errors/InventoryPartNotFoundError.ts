export class InventoryPartNotFoundError extends Error {
  constructor() {
    super('Inventory part not found');
    this.name = 'InventoryPartNotFoundError';
  }
}
