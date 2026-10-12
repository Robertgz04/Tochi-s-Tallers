import { Router } from 'express';
import { z } from 'zod';
import * as citaController from '../controllers/cita.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { validateBody, validateParams } from '../middlewares/validate';
import { ROLES_TALLER } from '../types/roles';
import {
  actualizarCitaSchema,
  cambiarEstadoCitaSchema,
  crearCitaSchema,
} from '../validators/cita.validators';

export const citaRoutes = Router();

citaRoutes.use(authMiddleware, tallerMiddleware);

const esquemaId = z.object({ id: z.string().uuid('Identificador de cita inválido.') });

citaRoutes.get('/', citaController.listar);
citaRoutes.get('/:id', validateParams(esquemaId), citaController.obtener);
citaRoutes.post('/', roleMiddleware(...ROLES_TALLER), validateBody(crearCitaSchema), citaController.crear);
citaRoutes.patch(
  '/:id',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(actualizarCitaSchema),
  citaController.actualizar,
);
citaRoutes.patch(
  '/:id/estado',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(cambiarEstadoCitaSchema),
  citaController.cambiarEstado,
);
citaRoutes.delete(
  '/:id',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  citaController.eliminar,
);
