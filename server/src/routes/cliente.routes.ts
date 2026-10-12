import { Router } from 'express';
import { z } from 'zod';
import * as clienteController from '../controllers/cliente.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { validateBody, validateParams } from '../middlewares/validate';
import { ROLES_ADMINISTRADORES, ROLES_TALLER } from '../types/roles';
import { actualizarClienteSchema, crearClienteSchema } from '../validators/cliente.validators';

export const clienteRoutes = Router();

clienteRoutes.use(authMiddleware, tallerMiddleware);

const esquemaId = z.object({
  id: z.string().uuid('Identificador de cliente inválido.'),
});

clienteRoutes.get('/', clienteController.listar);
clienteRoutes.get('/:id', validateParams(esquemaId), clienteController.obtener);
clienteRoutes.post(
  '/',
  roleMiddleware(...ROLES_TALLER),
  validateBody(crearClienteSchema),
  clienteController.crear,
);
clienteRoutes.patch(
  '/:id',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(actualizarClienteSchema),
  clienteController.actualizar,
);
clienteRoutes.delete(
  '/:id',
  roleMiddleware(...ROLES_ADMINISTRADORES),
  validateParams(esquemaId),
  clienteController.eliminar,
);
