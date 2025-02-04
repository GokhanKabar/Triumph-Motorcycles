import { v4 as uuidv4 } from "uuid";
import { MissingRequiredFieldError } from "../../errors/MissingRequiredFieldError";

export class CompanyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompanyValidationError";
  }
}

export default class Company {
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

    return new Company(
      id || uuidv4(),
      userId,
      name,
      address,
      createdAt || new Date(),
      updatedAt || new Date()
    );
  }

  public update(name?: string, address?: string) {
    return new Company(
      this.id,
      this.userId,
      name || this.name,
      address || this.address,
      this.createdAt,
      new Date()
    );
  }

  public toJSON(): Record<string, any> {
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
