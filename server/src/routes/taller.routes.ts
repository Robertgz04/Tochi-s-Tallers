import { Router } from 'express';
import * as tallerController from '../controllers/taller.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { validateBody } from '../middlewares/validate';
import { ROLES_ADMINISTRADORES } from '../types/roles';
import { actualizarTallerSchema } from '../validators/taller.validators';

export const tallerRoutes = Router();

tallerRoutes.use(authMiddleware, tallerMiddleware);

tallerRoutes.get('/mio', tallerController.obtenerMio);
tallerRoutes.put(
  '/mio',
  roleMiddleware(...ROLES_ADMINISTRADORES),
  validateBody(actualizarTallerSchema),
  tallerController.actualizarMio,
);
