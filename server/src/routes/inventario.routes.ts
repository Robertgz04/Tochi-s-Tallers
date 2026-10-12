import { Router } from 'express';
import { z } from 'zod';
import * as inventarioController from '../controllers/inventario.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { validateBody, validateParams } from '../middlewares/validate';
import { ROLES_TALLER } from '../types/roles';
import {
  actualizarItemSchema,
  crearItemSchema,
  movimientoSchema,
} from '../validators/inventario.validators';

export const inventarioRoutes = Router();

inventarioRoutes.use(authMiddleware, tallerMiddleware);

const esquemaId = z.object({ id: z.string().uuid('Identificador de producto inválido.') });

inventarioRoutes.get('/', inventarioController.listar);
inventarioRoutes.get('/:id', validateParams(esquemaId), inventarioController.obtener);
inventarioRoutes.post(
  '/',
  roleMiddleware(...ROLES_TALLER),
  validateBody(crearItemSchema),
  inventarioController.crear,
);
inventarioRoutes.patch(
  '/:id',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(actualizarItemSchema),
  inventarioController.actualizar,
);
inventarioRoutes.delete(
  '/:id',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  inventarioController.eliminar,
);
inventarioRoutes.post(
  '/movimientos',
  roleMiddleware(...ROLES_TALLER),
  validateBody(movimientoSchema),
  inventarioController.movimiento,
);
