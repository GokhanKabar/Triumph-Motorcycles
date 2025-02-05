import { v4 as uuidv4 } from "uuid";
import { MissingRequiredFieldError } from "../../errors/MissingRequiredFieldError";

export class ConcessionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConcessionValidationError";
  }
}

export default class Concession {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly address: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static from(
    id: string | undefined,
    userId: string,
    name: string,
    address: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    if (!name || !address) {
      return new MissingRequiredFieldError();
    }

    return new Concession(
      id || uuidv4(),
      userId,
      name,
      address,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      address: this.address,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
