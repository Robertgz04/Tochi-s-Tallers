import { Router } from 'express';
import { z } from 'zod';
import * as usuarioController from '../controllers/usuario.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { validateBody, validateParams } from '../middlewares/validate';
import { ROLES_ADMINISTRADORES } from '../types/roles';
import { actualizarUsuarioSchema, crearUsuarioSchema } from '../validators/usuario.validators';

export const usuarioRoutes = Router();

usuarioRoutes.use(authMiddleware, tallerMiddleware);

const esquemaId = z.object({
  id: z.string().uuid('Identificador de usuario inválido.'),
});

usuarioRoutes.get('/', roleMiddleware(...ROLES_ADMINISTRADORES), usuarioController.listar);
usuarioRoutes.post(
  '/',
  roleMiddleware(...ROLES_ADMINISTRADORES),
  validateBody(crearUsuarioSchema),
  usuarioController.crear,
);
usuarioRoutes.patch(
  '/:id',
  roleMiddleware(...ROLES_ADMINISTRADORES),
  validateParams(esquemaId),
  validateBody(actualizarUsuarioSchema),
  usuarioController.actualizar,
);
