import crypto from 'crypto';
import { env } from '../config/env';
import { pool, withTransaction } from '../config/db';
import * as usuarioRepo from '../repositories/usuario.repository';
import * as tallerRepo from '../repositories/taller.repository';
import * as suscripcionRepo from '../repositories/suscripcion.repository';
import type { UsuarioPublico } from '../types/auth';
import type { Taller } from '../types/taller';
import { ApiError } from '../utils/ApiError';
import { firmarToken } from '../utils/jwt';
import { hashPassword, verificarPassword } from '../utils/password';
import { aTaller, aUsuarioPublico } from '../utils/mappers';
import type {
  CambiarPasswordInput,
  LoginInput,
  RecuperarPasswordInput,
  RestablecerPasswordInput,
  RegistroInput,
} from '../validators/auth.validators';

const DURACION_PRUEBA_DIAS = 14;
const DURACION_RECUPERACION_MINUTOS = 60;

function fechaCorta(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export interface ResultadoRegistro {
  token: string;
  usuario: UsuarioPublico;
  taller: Taller;
}

export async function registrarse(datos: RegistroInput): Promise<ResultadoRegistro> {
  return withTransaction(async (cliente) => {
    const correoDuplicado = await usuarioRepo.correoExiste(cliente, datos.usuario.correo);
    if (correoDuplicado) {
      throw ApiError.conflicto('Ya existe una cuenta registrada con ese correo.');
    }

    const tallerFila = await tallerRepo.crearTaller(cliente, {
      nombre: datos.taller.nombre,
      telefono: datos.taller.telefono || null,
      correo: datos.taller.correo || null,
      direccion: datos.taller.direccion || null,
    });

    const hoy = new Date();
    const vencimiento = new Date(hoy);
    vencimiento.setDate(vencimiento.getDate() + DURACION_PRUEBA_DIAS);

    await suscripcionRepo.crearSuscripcion(cliente, {
      tallerId: tallerFila.id,
      plan: 'TRIAL',
      monto: 0,
      fechaInicio: fechaCorta(hoy),
      fechaVencimiento: fechaCorta(vencimiento),
      estado: 'ACTIVA',
    });

    const passwordHash = await hashPassword(datos.usuario.password);

    const usuarioFila = await usuarioRepo.crearUsuario(cliente, {
      tallerId: tallerFila.id,
      nombre: datos.usuario.nombre,
      apellidos: datos.usuario.apellidos,
      correo: datos.usuario.correo,
      telefono: datos.usuario.telefono || null,
      passwordHash,
      rol: 'PROPIETARIO',
    });

    const token = firmarToken({
      id: usuarioFila.id,
      correo: usuarioFila.correo,
      rol: usuarioFila.rol,
      tallerId: usuarioFila.taller_id,
    });

    return {
      token,
      usuario: aUsuarioPublico(usuarioFila),
      taller: aTaller(tallerFila),
    };
  });
}

export interface ResultadoLogin {
  token: string;
  usuario: UsuarioPublico;
}


export async function cambiarPassword(
  usuarioId: string,
  datos: CambiarPasswordInput,
): Promise<void> {
  const usuarioFila = await usuarioRepo.buscarUsuarioPorId(pool, usuarioId);
  if (!usuarioFila) {
    throw ApiError.noEncontrado('Usuario no encontrado.');
  }

  const actualValida = await verificarPassword(datos.passwordActual, usuarioFila.password_hash);
  if (!actualValida) {
    throw ApiError.badRequest('La contraseña actual no es correcta.');
  }

  const nuevoHash = await hashPassword(datos.passwordNueva);
  await usuarioRepo.actualizarPasswordHash(pool, usuarioId, nuevoHash);
}

export interface ResultadoRecuperacion {
  mensaje: string;
  /** Solo en desarrollo: permite probar el flujo sin correo electrónico. */
  tokenPrueba?: string;
}

export async function solicitarRecuperacion(
  datos: RecuperarPasswordInput,
): Promise<ResultadoRecuperacion> {
  const mensaje =
    'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.';

  const usuarioFila = await usuarioRepo.buscarUsuarioPorCorreo(pool, datos.correo);
  if (!usuarioFila || !usuarioFila.activo) {
    // No revelar si el correo existe o no (evita enumeración de cuentas).
    return { mensaje };
  }

  const token = crypto.randomBytes(24).toString('base64url');
  const expiraEn = new Date(Date.now() + DURACION_RECUPERACION_MINUTOS * 60 * 1000);

  await usuarioRepo.crearTokenRecuperacion(pool, {
    usuarioId: usuarioFila.id,
    token,
    expiraEn,
  });

  return {
    mensaje,
    ...(env.NODE_ENV !== 'production' ? { tokenPrueba: token } : {}),
  };
}

export async function restablecerPassword(datos: RestablecerPasswordInput): Promise<void> {
  const registro = await usuarioRepo.buscarTokenRecuperacion(pool, datos.token);

  if (!registro || registro.usado) {
    throw ApiError.badRequest('El enlace de recuperación no es válido o ya fue utilizado.');
  }

  if (new Date(registro.expira_en) < new Date()) {
    throw ApiError.badRequest('El enlace de recuperación ha expirado. Solicita uno nuevo.');
  }

  const usuarioFila = await usuarioRepo.buscarUsuarioPorId(pool, registro.usuario_id);
  if (!usuarioFila || !usuarioFila.activo) {
    throw ApiError.badRequest('La cuenta asociada al enlace ya no está disponible.');
  }

  const nuevoHash = await hashPassword(datos.passwordNueva);
  await usuarioRepo.actualizarPasswordHash(pool, usuarioFila.id, nuevoHash);
  await usuarioRepo.marcarTokenUsado(pool, datos.token);
}

export async function iniciarSesion(datos: LoginInput): Promise<ResultadoLogin> {
  const usuarioFila = await usuarioRepo.buscarUsuarioPorCorreo(pool, datos.correo);

  if (!usuarioFila) {
    throw ApiError.noAutorizado('Correo o contraseña incorrectos.');
  }

  if (!usuarioFila.activo) {
    throw ApiError.prohibido('Tu cuenta está desactivada. Contacta al administrador del taller.');
  }

  const passwordValida = await verificarPassword(datos.password, usuarioFila.password_hash);
  if (!passwordValida) {
    throw ApiError.noAutorizado('Correo o contraseña incorrectos.');
  }

  await usuarioRepo.actualizarUltimoAcceso(pool, usuarioFila.id);

  const token = firmarToken({
    id: usuarioFila.id,
    correo: usuarioFila.correo,
    rol: usuarioFila.rol,
    tallerId: usuarioFila.taller_id,
  });

  return { token, usuario: aUsuarioPublico(usuarioFila) };
}

export async function obtenerUsuarioActual(usuarioId: string): Promise<UsuarioPublico> {
  const usuarioFila = await usuarioRepo.buscarUsuarioPorId(pool, usuarioId);
  if (!usuarioFila || !usuarioFila.activo) {
    throw ApiError.noAutorizado('Tu cuenta ya no está disponible. Inicia sesión nuevamente.');
  }
  return aUsuarioPublico(usuarioFila);
}
