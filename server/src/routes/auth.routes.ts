import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validate';
import {
  cambiarPasswordSchema,
  loginSchema,
  recuperarPasswordSchema,
  registroSchema,
  restablecerPasswordSchema,
} from '../validators/auth.validators';

export const authRoutes = Router();

authRoutes.post('/registro', authLimiter, validateBody(registroSchema), authController.registrar);
authRoutes.post('/login', authLimiter, validateBody(loginSchema), authController.login);
authRoutes.post(
  '/recuperar',
  authLimiter,
  validateBody(recuperarPasswordSchema),
  authController.recuperar,
);
authRoutes.post(
  '/restablecer',
  authLimiter,
  validateBody(restablecerPasswordSchema),
  authController.restablecer,
);
authRoutes.get('/me', authMiddleware, authController.obtenerMe);
authRoutes.put(
  '/cambiar-password',
  authMiddleware,
  validateBody(cambiarPasswordSchema),
  authController.cambiarPassword,
);
