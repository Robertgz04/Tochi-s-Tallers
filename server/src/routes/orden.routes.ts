import { Router } from 'express';
import { z } from 'zod';
import * as ordenController from '../controllers/orden.controller';
import * as evidenciaController from '../controllers/evidencia.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';
import { subidaFoto } from '../middlewares/upload';
import { validateBody, validateParams } from '../middlewares/validate';
import { ROLES_TALLER } from '../types/roles';
import {
  actualizarOrdenSchema,
  cambiarEstadoSchema,
  crearOrdenSchema,
} from '../validators/orden.validators';
import { subirEvidenciaSchema } from '../validators/evidencia.validators';

export const ordenRoutes = Router();

ordenRoutes.use(authMiddleware, tallerMiddleware);

const esquemaId = z.object({
  id: z.string().uuid('Identificador de orden inválido.'),
});

ordenRoutes.get('/', ordenController.listar);
ordenRoutes.get('/estados', ordenController.estados);
ordenRoutes.get('/:id', validateParams(esquemaId), ordenController.obtener);
ordenRoutes.post(
  '/',
  roleMiddleware(...ROLES_TALLER),
  validateBody(crearOrdenSchema),
  ordenController.crear,
);
ordenRoutes.patch(
  '/:id',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(actualizarOrdenSchema),
  ordenController.actualizar,
);
ordenRoutes.patch(
  '/:id/estado',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  validateBody(cambiarEstadoSchema),
  ordenController.cambiarEstado,
);

const esquemaEvidenciaId = z.object({
  id: z.string().uuid('Identificador de orden inválido.'),
  evidenciaId: z.string().uuid('Identificador de evidencia inválido.'),
});

ordenRoutes.get('/:id/evidencias', validateParams(esquemaId), evidenciaController.listar);
ordenRoutes.post(
  '/:id/evidencias',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaId),
  subidaFoto.single('foto'),
  validateBody(subirEvidenciaSchema),
  evidenciaController.subir,
);
ordenRoutes.delete(
  '/:id/evidencias/:evidenciaId',
  roleMiddleware(...ROLES_TALLER),
  validateParams(esquemaEvidenciaId),
  evidenciaController.eliminar,
);
