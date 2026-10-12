import { Router } from 'express';
import { z } from 'zod';
import * as pagoController from '../controllers/pago.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { validateBody, validateParams } from '../middlewares/validate';
import { ROLES_ADMINISTRADORES, ROLES_TALLER } from '../types/roles';
import { crearPagoSchema } from '../validators/pago.validators';

export const pagoRoutes = Router();

pagoRoutes.use(authMiddleware, tallerMiddleware);

const esquemaId = z.object({ id: z.string().uuid('Identificador de pago inválido.') });

pagoRoutes.get('/', pagoController.listar);
pagoRoutes.post('/', roleMiddleware(...ROLES_TALLER), validateBody(crearPagoSchema), pagoController.crear);
pagoRoutes.delete(
  '/:id',
  roleMiddleware(...ROLES_ADMINISTRADORES),
  validateParams(esquemaId),
  pagoController.eliminar,
);