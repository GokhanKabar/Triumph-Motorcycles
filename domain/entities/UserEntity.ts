export class User {
    constructor(
        public readonly id: string,
        public readonly admin: boolean,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly password: string,
        public readonly email: string,
    ) {}

}