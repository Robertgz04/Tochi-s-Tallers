import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import type { Rol } from '../types/roles';

/**
 * Restringe el acceso a los roles indicados.
 * Debe usarse después de authMiddleware.
 */
export function roleMiddleware(...rolesPermitidos: Rol[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Autenticación requerida.'));
      return;
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      next(new ApiError(403, 'No tienes permisos para realizar esta acción.'));
      return;
    }

    next();
  };
}
