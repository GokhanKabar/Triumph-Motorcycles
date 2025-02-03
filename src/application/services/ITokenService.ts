export interface ITokenService {
  generateToken(payload: any, expiresIn: number): Promise<string>;
  generateRefreshToken(payload: any): Promise<string>;
  verifyToken(token: string): Promise<any>;
  verifyRefreshToken(token: string): Promise<any>;
}
