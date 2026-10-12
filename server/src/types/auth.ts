import type { Rol } from './roles';

/** Información del usuario que viene dentro del JWT verificado. */
export interface UsuarioAutenticado {
  id: string;
  correo: string;
  rol: Rol;
  tallerId: string | null;
}

/** Usuario sin datos sensibles (sin password_hash). */
export interface UsuarioPublico {
  id: string;
  tallerId: string | null;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  rol: Rol;
  fotoUrl: string | null;
  activo: boolean;
  ultimoAcceso: string | null;
}
