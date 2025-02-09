import express from 'express';
import { UserController } from '../controllers/UserController';
import { CreateUserUseCase } from '../../../application/user/use-cases/CreateUserUseCase';
import { GetUserUseCase } from '../../../application/user/use-cases/GetUserUseCase';
import { UpdateUserUseCase } from '../../../application/user/use-cases/UpdateUserUseCase';
import { UpdateUserPasswordUseCase } from '../../../application/user/use-cases/UpdateUserPasswordUseCase';
import { ValidationService } from '../../../infrastructure/services/ValidationService';
import { PostgreSQLUserRepository } from '../../../infrastructure/repositories/PostgreSQLUserRepository';
import { Argon2PasswordHashingService } from '../../../infrastructure/services/Argon2PasswordHashingService';
import { GetAllUsersUseCase } from '../../../application/user/use-cases/GetAllUsersUseCase';
import { DeleteUserUseCase } from '../../../application/user/use-cases/DeleteUserUseCase';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { JWTTokenService } from '../../../infrastructure/services/TokenService';

const router = express.Router();

// Création des instances
const passwordHashingService = new Argon2PasswordHashingService();
const userRepository = new PostgreSQLUserRepository(passwordHashingService);
const createUserUseCase = new CreateUserUseCase(userRepository, passwordHashingService);
const getUserUseCase = new GetUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const validationService = new ValidationService();
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const updateUserPasswordUseCase = new UpdateUserPasswordUseCase(userRepository, passwordHashingService);

// Création des instances de services et use cases pour le middleware
const tokenService = new JWTTokenService();
const getUserUseCaseForAuth = new GetUserUseCase(userRepository);
const authMiddleware = new AuthMiddleware(tokenService, getUserUseCaseForAuth);

// Création du contrôleur avec injection des dépendances
const userController = new UserController(
  createUserUseCase,
  getUserUseCase,
  updateUserUseCase,
  validationService,
  getAllUsersUseCase,
  deleteUserUseCase,
  updateUserPasswordUseCase
);

// Routes

router.use(authMiddleware.authenticate.bind(authMiddleware));

router.get('/all', 
  (req, res, next) => {
    console.log('DEBUG: Route /all appelée');
    console.log('DEBUG: Utilisateur connecté:', req.user);
    next();
  },
  authMiddleware.adminOnly.bind(authMiddleware), 
  userController.getAll.bind(userController)
);

router.get('/', 
  (req, res, next) => {
    console.log('DEBUG: Route / appelée');
    console.log('DEBUG: Utilisateur connecté:', req.user);
    next();
  },
  authMiddleware.adminOnly.bind(authMiddleware), 
  userController.getAll.bind(userController)
);

router.get('/:id', 
  authMiddleware.adminOnly.bind(authMiddleware), 
  userController.getById.bind(userController)
);

router.post('/', 
  userController.create.bind(userController)
);

router.put('/:id', 
  authMiddleware.adminOnly.bind(authMiddleware), 
  userController.update.bind(userController)
);

router.delete('/:id', 
  authMiddleware.adminOnly.bind(authMiddleware), 
  userController.delete.bind(userController)
);

router.post(
  '/admin', 
  authMiddleware.adminOnly.bind(authMiddleware),
  userController.createAdminUser.bind(userController)
);

router.post(
  '/reset-password/:userId', 
  authMiddleware.adminOnly.bind(authMiddleware),
  userController.resetUserPasswordByAdmin.bind(userController)
);

router.post(
  '/update-password', 
  userController.updateUserPassword.bind(userController)
);

export default router;
