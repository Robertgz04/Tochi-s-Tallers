import type { Request, Response } from 'express';
import * as usuarioService from '../services/usuario.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId, usuario } from '../utils/request';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const usuarios = await usuarioService.listarUsuarios(tallerId(req));
  responderExito(res, usuarios);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const nuevo = await usuarioService.crearUsuarioEnTaller(tallerId(req), req.body);
  responderExito(res, nuevo, 201);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const actualizado = await usuarioService.actualizarUsuarioEnTaller(
    tallerId(req),
    req.params.id,
    req.body,
    usuario(req).id,
  );
  responderExito(res, actualizado);
});
