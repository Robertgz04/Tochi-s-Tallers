import { pool } from '../config/db';
import * as vehiculoRepo from '../repositories/vehiculo.repository';
import * as clienteRepo from '../repositories/cliente.repository';
import { ApiError } from '../utils/ApiError';
import { traducirErrorPg } from '../utils/pgError';

export interface Vehiculo {
  id: string;
  clienteId: string;
  clienteNombre: string;
  placa: string;
  vin: string | null;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  motor: string | null;
  kilometraje: number;
  combustible: string;
  transmision: string | null;
  notas: string | null;
  fotoUrl: string | null;
  fechaRegistro: string;
  ordenes: number;
}

function aVehiculo(fila: vehiculoRepo.VehiculoFila): Vehiculo {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    clienteNombre: fila.cliente_nombre ?? '—',
    placa: fila.placa,
    vin: fila.vin,
    marca: fila.marca,
    modelo: fila.modelo,
    anio: fila.anio,
    color: fila.color,
    motor: fila.motor,
    kilometraje: fila.kilometraje,
    combustible: fila.combustible,
    transmision: fila.transmision,
    notas: fila.notas,
    fotoUrl: fila.foto_url,
    fechaRegistro: fila.fecha_registro,
    ordenes: Number(fila.ordenes_count ?? 0),
  };
}

interface OpcionesVehiculos {
  busqueda?: string;
  clienteId?: string;
}

export async function listarVehiculos(
  tallerId: string,
  opciones: OpcionesVehiculos = {},
): Promise<Vehiculo[]> {
  const filas = await vehiculoRepo.listarVehiculos(pool, tallerId, opciones);
  return filas.map(aVehiculo);
}

export async function obtenerVehiculo(tallerId: string, id: string): Promise<Vehiculo> {
  const fila = await vehiculoRepo.buscarVehiculo(pool, tallerId, id);
  if (!fila) throw ApiError.noEncontrado('Vehículo no encontrado en tu taller.');
  return aVehiculo(fila);
}

async function verificarCliente(tallerId: string, clienteId: string): Promise<void> {
  const cliente = await clienteRepo.buscarCliente(pool, tallerId, clienteId);
  if (!cliente) throw ApiError.noEncontrado('El cliente seleccionado no existe en tu taller.');
}

export async function crearVehiculo(
  tallerId: string,
  datos: vehiculoRepo.DatosNuevoVehiculo,
): Promise<Vehiculo> {
  await verificarCliente(tallerId, datos.clienteId);
  try {
    const fila = await vehiculoRepo.crearVehiculo(pool, tallerId, {
      ...datos,
      vin: datos.vin || null,
      color: datos.color || null,
      motor: datos.motor || null,
      notas: datos.notas || null,
      transmision: datos.transmision || null,
      anio: datos.anio ?? null,
      kilometraje: datos.kilometraje ?? 0,
      combustible: datos.combustible ?? 'GASOLINA',
    });
    return aVehiculo({ ...fila, cliente_nombre: '', ordenes_count: '0' });
  } catch (error) {
    traducirErrorPg(error, 'Ya existe un vehículo con esa placa o VIN en tu taller.');
  }
}

export async function actualizarVehiculo(
  tallerId: string,
  id: string,
  campos: vehiculoRepo.CamposVehiculo,
): Promise<Vehiculo> {
  const existente = await vehiculoRepo.buscarVehiculo(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Vehículo no encontrado en tu taller.');

  try {
    const fila = await vehiculoRepo.actualizarVehiculo(pool, tallerId, id, {
      ...campos,
      vin: campos.vin === undefined ? undefined : campos.vin || null,
      color: campos.color === undefined ? undefined : campos.color || null,
      motor: campos.motor === undefined ? undefined : campos.motor || null,
      notas: campos.notas === undefined ? undefined : campos.notas || null,
      transmision: campos.transmision === undefined ? undefined : campos.transmision || null,
    });
    if (!fila) throw ApiError.noEncontrado('Vehículo no encontrado en tu taller.');
    return aVehiculo({
      ...fila,
      cliente_nombre: existente.cliente_nombre,
      ordenes_count: existente.ordenes_count,
    });
  } catch (error) {
    traducirErrorPg(error, 'Ya existe un vehículo con esa placa o VIN en tu taller.');
  }
}

export async function eliminarVehiculo(tallerId: string, id: string): Promise<void> {
  const existe = await vehiculoRepo.buscarVehiculo(pool, tallerId, id);
  if (!existe) throw ApiError.noEncontrado('Vehículo no encontrado en tu taller.');

  try {
    const eliminado = await vehiculoRepo.eliminarVehiculo(pool, tallerId, id);
    if (!eliminado) throw ApiError.noEncontrado('Vehículo no encontrado en tu taller.');
  } catch (error) {
    traducirErrorPg(error);
  }
}
