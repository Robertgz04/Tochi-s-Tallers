import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { usuario } from '../utils/request';

export const registrar = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await authService.registrarse(req.body);
  responderExito(res, resultado, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await authService.iniciarSesion(req.body);
  responderExito(res, resultado);
});

export const obtenerMe = asyncHandler(async (req: Request, res: Response) => {
  const usuarioActual = await authService.obtenerUsuarioActual(usuario(req).id);
  responderExito(res, usuarioActual);
});

export const cambiarPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.cambiarPassword(usuario(req).id, req.body);
  responderExito(res, { mensaje: 'Contraseña actualizada correctamente.' });
});

export const recuperar = asyncHandler(async (req: Request, res: Response) => {
  const resultado = await authService.solicitarRecuperacion(req.body);
  responderExito(res, resultado);
});

export const restablecer = asyncHandler(async (req: Request, res: Response) => {
  await authService.restablecerPassword(req.body);
  responderExito(res, { mensaje: 'Contraseña restablecida correctamente.' });
});
