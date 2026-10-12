import type { UsuarioAutenticado } from './auth';

declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado (populate por authMiddleware). */
      user?: UsuarioAutenticado;
      /** taller_id del usuario autenticado (populate por tallerMiddleware). */
      tallerId?: string;
    }
  }
}

export {};
