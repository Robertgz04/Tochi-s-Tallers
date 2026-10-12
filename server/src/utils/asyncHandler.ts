import type { NextFunction, Request, RequestHandler, Response } from 'express';

type ManejadorAsync = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Envuelve manejadores asíncronos para que sus rechazos lleguen
 * al middleware global de errores (Express 4 no lo hace automáticamente).
 */
export function asyncHandler(manejador: ManejadorAsync): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(manejador(req, res, next)).catch(next);
  };
}
