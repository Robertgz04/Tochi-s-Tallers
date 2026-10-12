import { pool } from '../config/db';
import * as clienteRepo from '../repositories/cliente.repository';
import { ApiError } from '../utils/ApiError';
import { traducirErrorPg } from '../utils/pgError';
import type { Cliente } from '../types/orden';
import type { CrearClienteInput, ActualizarClienteInput } from '../validators/cliente.validators';

function aCliente(fila: clienteRepo.ClienteFila): Cliente {
  return {
    id: fila.id,
    nombre: fila.nombre,
    apellidos: fila.apellidos,
    telefono: fila.telefono,
    whatsapp: fila.whatsapp,
    correo: fila.correo,
    direccion: fila.direccion,
    notas: fila.notas,
    fechaRegistro: fila.fecha_registro,
    activo: fila.activo,
    vehiculos: Number(fila.vehiculos ?? 0),
  };
}

export async function listarClientes(tallerId: string, busqueda?: string): Promise<Cliente[]> {
  const filas = await clienteRepo.listarClientes(pool, tallerId, busqueda);
  return filas.map(aCliente);
}

export async function obtenerCliente(tallerId: string, id: string): Promise<Cliente> {
  const fila = await clienteRepo.buscarCliente(pool, tallerId, id);
  if (!fila) throw ApiError.noEncontrado('Cliente no encontrado en tu taller.');
  return aCliente(fila);
}

export async function crearCliente(tallerId: string, datos: CrearClienteInput): Promise<Cliente> {
  try {
    const fila = await clienteRepo.crearCliente(pool, tallerId, {
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      telefono: datos.telefono || null,
      whatsapp: datos.whatsapp || null,
      correo: datos.correo || null,
      direccion: datos.direccion || null,
      notas: datos.notas || null,
    });
    return aCliente({ ...fila, vehiculos: '0' });
  } catch (error) {
    traducirErrorPg(error, 'Ya existe un cliente con ese correo en tu taller.');
  }
}

export async function actualizarCliente(
  tallerId: string,
  id: string,
  cambios: ActualizarClienteInput,
): Promise<Cliente> {
  const existente = await clienteRepo.buscarCliente(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Cliente no encontrado en tu taller.');

  try {
    const fila = await clienteRepo.actualizarCliente(pool, tallerId, id, {
      nombre: cambios.nombre,
      apellidos: cambios.apellidos,
      telefono: cambios.telefono === undefined ? undefined : cambios.telefono || null,
      whatsapp: cambios.whatsapp === undefined ? undefined : cambios.whatsapp || null,
      correo: cambios.correo === undefined ? undefined : cambios.correo || null,
      direccion: cambios.direccion === undefined ? undefined : cambios.direccion || null,
      notas: cambios.notas === undefined ? undefined : cambios.notas || null,
      activo: cambios.activo,
    });
    if (!fila) throw ApiError.noEncontrado('Cliente no encontrado en tu taller.');
    return aCliente({ ...fila, vehiculos: existente.vehiculos });
  } catch (error) {
    traducirErrorPg(error, 'Ya existe un cliente con ese correo en tu taller.');
  }
}

export async function eliminarCliente(tallerId: string, id: string): Promise<void> {
  const existe = await clienteRepo.buscarCliente(pool, tallerId, id);
  if (!existe) throw ApiError.noEncontrado('Cliente no encontrado en tu taller.');

  try {
    const eliminado = await clienteRepo.eliminarCliente(pool, tallerId, id);
    if (!eliminado) throw ApiError.noEncontrado('Cliente no encontrado en tu taller.');
  } catch (error) {
    traducirErrorPg(error);
  }
}
