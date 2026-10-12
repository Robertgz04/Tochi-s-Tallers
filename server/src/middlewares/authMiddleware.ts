import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { verificarToken } from '../utils/jwt';

/** Valida el header Authorization: Bearer <jwt> y popula req.user. */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith('Bearer ')) {
    next(new ApiError(401, 'Token de autenticación no proporcionado.'));
    return;
  }

  try {
    const payload = verificarToken(autorizacion.slice(7));
    req.user = {
      id: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
      tallerId: payload.tallerId,
    };
    next();
  } catch (error) {
    next(error);
  }
}
