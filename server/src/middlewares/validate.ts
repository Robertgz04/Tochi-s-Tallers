import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

function validar(esquema: ZodTypeAny, origen: 'body' | 'params'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const fuente = origen === 'body' ? req.body : req.params;
    const resultado = esquema.safeParse(fuente);
    if (!resultado.success) {
      const primerError = resultado.error.issues[0];
      const mensaje = primerError
        ? primerError.message
        : 'Los datos enviados no son válidos.';
      next(new ApiError(400, mensaje));
      return;
    }
    if (origen === 'body') {
      req.body = resultado.data;
    } else {
      Object.assign(req.params, resultado.data);
    }
    next();
  };
}

/** Valida req.body con el esquema Zod indicado. Reemplaza req.body con los datos saneados. */
export function validateBody(esquema: ZodTypeAny): RequestHandler {
  return validar(esquema, 'body');
}

/** Valida req.params con el esquema Zod indicado (ej. IDs UUID). */
export function validateParams(esquema: ZodTypeAny): RequestHandler {
  return validar(esquema, 'params');
}
