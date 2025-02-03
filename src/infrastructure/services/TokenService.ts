import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../../domain/enums/UserRole';
import crypto from 'crypto';

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  purpose?: 'reset-password';
  type?: 'access' | 'refresh';
}

export interface ITokenService {
  generateToken(payload: TokenPayload, expiresIn?: number): Promise<string>;
  generateRefreshToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}

export class JWTTokenService implements ITokenService {
  private readonly secretKey: Secret;
  private readonly refreshKey: Secret;
  private readonly defaultExpiresIn: number;
  private readonly refreshExpiresIn: number;

  constructor() {
    // Utiliser des clés secrètes différentes pour les tokens d'accès et de rafraîchissement
    // Vérifier que les variables d'environnement sont définies
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('JWT_SECRET_KEY n\'est pas définie. Veuillez la définir dans le fichier .env');
    }
    if (!process.env.JWT_REFRESH_KEY) {
      throw new Error('JWT_REFRESH_KEY n\'est pas définie. Veuillez la définir dans le fichier .env');
    }

    this.secretKey = process.env.JWT_SECRET_KEY;
    this.refreshKey = process.env.JWT_REFRESH_KEY;
    
    // Par défaut, 1 heure pour le token d'accès
    this.defaultExpiresIn = 60 * 60;
    // 7 jours pour le token de rafraîchissement
    this.refreshExpiresIn = 7 * 24 * 60 * 60;
  }

  async generateToken(payload: TokenPayload, expiresIn?: number): Promise<string> {
    const options: SignOptions = {
      expiresIn: expiresIn || this.defaultExpiresIn,
      audience: 'triumph-motorcycles-api',
      issuer: 'triumph-motorcycles',
      jwtid: crypto.randomBytes(16).toString('hex'),
    };

    const finalPayload = {
      ...payload,
      type: 'access',
    };

    return jwt.sign(finalPayload, this.secretKey, options);
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: this.refreshExpiresIn,
      audience: 'triumph-motorcycles-api',
      issuer: 'triumph-motorcycles',
      jwtid: crypto.randomBytes(16).toString('hex'),
    };

    const finalPayload = {
      ...payload,
      type: 'refresh',
    };

    return jwt.sign(finalPayload, this.refreshKey, options);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      console.log('Verifying Token:', token); // Log du token à vérifier
      console.log('Secret Key:', this.secretKey); // Log de la clé secrète utilisée

      const decoded = jwt.verify(token, this.secretKey, {
        audience: 'triumph-motorcycles-api',
        issuer: 'triumph-motorcycles',
      });

      console.log('Decoded Token:', decoded); // Log du token décodé

      if (typeof decoded === 'string') {
        console.log('Decoded token is a string, which is unexpected'); // Log si décodage inattendu
        throw new Error('Token invalide');
      }

      if (decoded.type !== 'access') {
        console.log('Token type is not access:', decoded.type); // Log du type de token
        throw new Error('Type de token invalide');
      }

      return decoded as TokenPayload;
    } catch (error) {
      console.error('Token Verification Error:', error); // Log de l'erreur de vérification
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expiré');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token invalide');
      }
      throw error;
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.refreshKey, {
        audience: 'triumph-motorcycles-api',
        issuer: 'triumph-motorcycles',
      });

      if (typeof decoded === 'string') {
        throw new Error('Token invalide');
      }

      // Vérifier que c'est bien un token de rafraîchissement
      if (decoded.type !== 'refresh') {
        throw new Error('Type de token invalide');
      }

      return decoded as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token de rafraîchissement expiré');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token de rafraîchissement invalide');
      }
      throw error;
    }
  }

  /**
   * Convertit une chaîne de durée (ex: '1h', '1d') en secondes
   */
  private convertToSeconds(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        throw new Error('Format de durée invalide');
    }
  }
}
