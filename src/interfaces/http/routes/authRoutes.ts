import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { JWTTokenService } from '../../../infrastructure/services/TokenService';
import { Argon2PasswordHashingService } from '../../../infrastructure/services/Argon2PasswordHashingService';
import { CreateUserUseCase } from '../../../application/user/use-cases/CreateUserUseCase';
import { GetUserUseCase } from '../../../application/user/use-cases/GetUserUseCase';
import { UpdateUserUseCase } from '../../../application/user/use-cases/UpdateUserUseCase';
import { LoginUseCase } from '../../../application/user/use-cases/LoginUseCase';
import { PostgreSQLUserRepository } from '../../../infrastructure/repositories/PostgreSQLUserRepository';
import { ValidationService } from '../../../infrastructure/services/ValidationService';
import { UserRole } from '../../../domain/enums/UserRole';

const router = Router();

// Services
const passwordHashingService = new Argon2PasswordHashingService();
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const tokenService = new JWTTokenService();
const validationService = new ValidationService();

// Use Cases
const createUserUseCase = new CreateUserUseCase(userRepository, passwordHashingService);
const getUserUseCase = new GetUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository, passwordHashingService);

// Controllers
const authController = new AuthController(
  createUserUseCase,
  getUserUseCase,
  updateUserUseCase,
  loginUseCase,
  tokenService,
  passwordHashingService,
  validationService
);

// Middleware
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCase);

// Routes publiques
router.post('/register', async (req, res) => await authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

// Routes protégées
router.get('/me', authMiddleware.authenticate.bind(authMiddleware), (req, res) => authController.getCurrentUser(req, res));

// Routes protégées pour l'admin
router.post('/admin/create-user', 
  authMiddleware.authenticate.bind(authMiddleware), 
  authMiddleware.checkRole([UserRole.ADMIN]), 
  (req, res) => authController.createAdminUser(req, res));

export { router as authRoutes };
