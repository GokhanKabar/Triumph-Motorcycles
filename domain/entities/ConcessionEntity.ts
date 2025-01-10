import { User } from "./UserEntity";

export class Concession {
    constructor(
        public readonly id: string,
        public readonly userId: User
    ) {}

}