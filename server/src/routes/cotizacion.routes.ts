import { Router } from 'express';
import { z } from 'zod';
import * as cotizacionController from '../controllers/cotizacion.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { validateBody, validateParams } from '../middlewares/validate';
import { ROLES_TALLER } from '../types/roles';
import {
  actualizarCotizacionSchema,
  cambiarEstadoCotizacionSchema,
  crearCotizacionSchema,
} from '../validators/cotizacion.validators';

export const cotizacionRoutes = Router();

cotizacionRoutes.use(authMiddleware, tallerMiddleware);

const esquemaId = z.object({ id: z.string().uuid('Identificador de cotización inválido.') });

cotizacionRoutes.get('/', cotizacionController.listar);
cotizacionRoutes.get('/estados', cotizacionController.estados);
cotizacionRoutes.get('/:id', validateParams(esquemaId), cotizacionController.obtener);
cotizacionRoutes.post(
  '/',
  roleMiddleware(...ROLES_TALLER),
  validateBody(crearCotizacionSchema),
  cotizacionController.crear,
);
cotizacionRoutes.patch(
  '/:id',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(actualizarCotizacionSchema),
  cotizacionController.actualizar,
);
cotizacionRoutes.patch(
  '/:id/estado',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(cambiarEstadoCotizacionSchema),
  cotizacionController.cambiarEstado,
);