import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Asegura que el usuario autenticado pertenezca a un taller y popula req.tallerId.
 *
 * REGLA DE SEGURIDAD: el taller_id NUNCA se acepta del frontend.
 * Siempre proviene del token JWT verificado.
 */
export function tallerMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new ApiError(401, 'Autenticación requerida.'));
    return;
  }

  if (!req.user.tallerId) {
    next(
      new ApiError(
        403,
        'Tu usuario no pertenece a un taller. Esta sección no está disponible.',
      ),
    );
    return;
  }

  req.tallerId = req.user.tallerId;
  next();
}
