import type { Request } from 'express';
import { ApiError } from './ApiError';
import type { UsuarioAutenticado } from '../types/auth';

/** Devuelve el usuario autenticado o lanza 401 (usar tras authMiddleware). */
export function usuario(req: Request): UsuarioAutenticado {
  if (!req.user) {
    throw ApiError.noAutorizado('Autenticación requerida.');
  }
  return req.user;
}

/** Devuelve el taller del usuario autenticado o lanza 403 (usar tras tallerMiddleware). */
export function tallerId(req: Request): string {
  if (!req.tallerId) {
    throw ApiError.prohibido('Tu usuario no pertenece a un taller.');
  }
  return req.tallerId;
}
