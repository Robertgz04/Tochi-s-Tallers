import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { Rol } from '../types/roles';
import { ApiError } from './ApiError';

export interface PayloadToken {
  sub: string;
  correo: string;
  rol: Rol;
  tallerId: string | null;
}

export function firmarToken(datos: {
  id: string;
  correo: string;
  rol: Rol;
  tallerId: string | null;
}): string {
  return jwt.sign(
    { correo: datos.correo, rol: datos.rol, tallerId: datos.tallerId },
    env.JWT_SECRET,
    {
      subject: datos.id,
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'tochistaller',
    },
  );
}

export function verificarToken(token: string): PayloadToken {
  try {
    const decodificado = jwt.verify(token, env.JWT_SECRET, { issuer: 'tochistaller' });
    if (
      typeof decodificado === 'string' ||
      typeof decodificado.sub !== 'string' ||
      typeof decodificado.correo !== 'string' ||
      typeof decodificado.rol !== 'string'
    ) {
      throw new ApiError(401, 'Token inválido');
    }
    return {
      sub: decodificado.sub,
      correo: decodificado.correo,
      rol: decodificado.rol as Rol,
      tallerId: typeof decodificado.tallerId === 'string' ? decodificado.tallerId : null,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Tu sesión ha expirado. Inicia sesión nuevamente.');
  }
}
