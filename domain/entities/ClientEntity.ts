import { User } from "./UserEntity";

export class Client {
  constructor(public readonly id: string, public readonly userId: User) {}
}
