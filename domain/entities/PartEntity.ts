export class Part {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly reference: string,
    public readonly price: number,
    private _currentStock: number,
    public readonly minimumStock: number
  ) {}
  get currentStock(): number {
    return this._currentStock;
  }

  updateStock(quantity: number): void {
    const newStock = this._currentStock + quantity;
    if (newStock < 0) {
      throw new Error("Stock cannot be negative");
    }
    this._currentStock = newStock;
  }

  isLowStock(): boolean {
    return this._currentStock <= this.minimumStock;
  }
}
