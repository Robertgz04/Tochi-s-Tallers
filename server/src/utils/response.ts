import type { Response } from 'express';

/** Respuesta estándar de éxito: { success: true, data } */
export function responderExito<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}

/** Respuesta estándar de error: { success: false, message } */
export function responderError(res: Response, statusCode: number, message: string): Response {
  return res.status(statusCode).json({ success: false, message });
}
