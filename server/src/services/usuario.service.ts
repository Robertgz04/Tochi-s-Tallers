import { pool } from '../config/db';
import * as usuarioRepo from '../repositories/usuario.repository';
import type { UsuarioPublico } from '../types/auth';
import { ApiError } from '../utils/ApiError';
import { hashPassword } from '../utils/password';
import { aUsuarioPublico } from '../utils/mappers';
import type { CrearUsuarioInput, ActualizarUsuarioInput } from '../validators/usuario.validators';

export async function listarUsuarios(tallerId: string): Promise<UsuarioPublico[]> {
  const filas = await usuarioRepo.listarUsuariosPorTaller(pool, tallerId);
  return filas.map(aUsuarioPublico);
}

export async function crearUsuarioEnTaller(
  tallerId: string,
  datos: CrearUsuarioInput,
): Promise<UsuarioPublico> {
  if (datos.rol === 'SUPER_ADMIN') {
    throw ApiError.prohibido('No es posible crear usuarios SUPER_ADMIN desde un taller.');
  }

  const existe = await usuarioRepo.correoExiste(pool, datos.correo);
  if (existe) {
    throw ApiError.conflicto('Ya existe una cuenta con ese correo.');
  }

  const passwordHash = await hashPassword(datos.password);

  const fila = await usuarioRepo.crearUsuario(pool, {
    tallerId,
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    correo: datos.correo,
    telefono: datos.telefono || null,
    passwordHash,
    rol: datos.rol,
  });

  return aUsuarioPublico(fila);
}

export async function actualizarUsuarioEnTaller(
  tallerId: string,
  usuarioId: string,
  cambios: ActualizarUsuarioInput,
  actorId: string,
): Promise<UsuarioPublico> {
  const existente = await usuarioRepo.buscarUsuarioDeTaller(pool, tallerId, usuarioId);
  if (!existente) {
    throw ApiError.noEncontrado('Usuario no encontrado en tu taller.');
  }

  if (existente.rol === 'SUPER_ADMIN') {
    throw ApiError.prohibido('No es posible modificar a un usuario SUPER_ADMIN.');
  }

  if (usuarioId === actorId) {
    if (cambios.activo === false) {
      throw ApiError.badRequest('No puedes desactivar tu propia cuenta.');
    }
    if (cambios.rol !== undefined && cambios.rol !== existente.rol) {
      throw ApiError.badRequest('No puedes cambiar tu propio rol.');
    }
  }

  if (cambios.rol === 'SUPER_ADMIN') {
    throw ApiError.prohibido('No es posible asignar el rol SUPER_ADMIN desde un taller.');
  }

  const fila = await usuarioRepo.actualizarUsuario(pool, tallerId, usuarioId, {
    nombre: cambios.nombre,
    apellidos: cambios.apellidos,
    telefono: cambios.telefono === undefined ? undefined : cambios.telefono || null,
    rol: cambios.rol,
    activo: cambios.activo,
  });

  if (!fila) {
    throw ApiError.noEncontrado('Usuario no encontrado en tu taller.');
  }

  return aUsuarioPublico(fila);
}
