import { User } from "./UserEntity";

export class Company {
  constructor(
    public readonly id: string,
    public readonly userId: User,
    public readonly name: string,
    public readonly address: string
  ) {}
}
