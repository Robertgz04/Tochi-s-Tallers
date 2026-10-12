import { Router } from 'express';
import { z } from 'zod';
import * as vehiculoController from '../controllers/vehiculo.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { validateBody, validateParams } from '../middlewares/validate';
import { ROLES_ADMINISTRADORES, ROLES_TALLER } from '../types/roles';
import { actualizarVehiculoSchema, crearVehiculoSchema } from '../validators/vehiculo.validators';

export const vehiculoRoutes = Router();

vehiculoRoutes.use(authMiddleware, tallerMiddleware);

const esquemaId = z.object({
  id: z.string().uuid('Identificador de vehículo inválido.'),
});

vehiculoRoutes.get('/', vehiculoController.listar);
vehiculoRoutes.get('/:id', validateParams(esquemaId), vehiculoController.obtener);
vehiculoRoutes.post(
  '/',
  roleMiddleware(...ROLES_TALLER),
  validateBody(crearVehiculoSchema),
  vehiculoController.crear,
);
vehiculoRoutes.patch(
  '/:id',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(actualizarVehiculoSchema),
  vehiculoController.actualizar,
);
vehiculoRoutes.delete(
  '/:id',
  roleMiddleware(...ROLES_ADMINISTRADORES),
  validateParams(esquemaId),
  vehiculoController.eliminar,
);
