export class User {
  constructor(
    public readonly id: string,
    public readonly isAdmin: boolean,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly password: string,
    public readonly email: string
  ) {}
}
