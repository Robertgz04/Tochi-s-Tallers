import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { responderError } from '../utils/response';

export function noEncontrado(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandlerGlobal(
  error: unknown,
  _req: Request,
  res: Response,
  // Express solo reconoce un middleware de errores si recibe los 4 parámetros.
  _next: NextFunction,
): Response {
  if (error instanceof ApiError) {
    return responderError(res, error.statusCode, error.message);
  }

  if (error instanceof ZodError) {
    const primerError = error.issues[0];
    const mensaje = primerError ? primerError.message : 'Datos inválidos';
    return responderError(res, 400, mensaje);
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return responderError(res, 400, 'La imagen no puede superar 10 MB.');
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return responderError(res, 400, 'Campo de archivo inesperado. Usa el campo "foto".');
    }
    return responderError(res, 400, 'No se pudo procesar la imagen adjunta.');
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return responderError(res, 400, 'El cuerpo de la petición no es JSON válido.');
  }

  console.error('[error] Error no controlado:', error);
  return responderError(res, 500, 'Ocurrió un error inesperado. Inténtalo nuevamente.');
}
