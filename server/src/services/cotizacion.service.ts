import { pool } from '../config/db';
import * as cotizacionRepo from '../repositories/cotizacion.repository';
import * as clienteRepo from '../repositories/cliente.repository';
import * as vehiculoRepo from '../repositories/vehiculo.repository';
import * as ordenRepo from '../repositories/orden.repository';
import { ApiError } from '../utils/ApiError';
import type {
  ActualizarCotizacionInput,
  CrearCotizacionInput,
  EstadoCotizacion,
} from '../validators/cotizacion.validators';

export interface CotizacionResumen {
  id: string;
  folio: string;
  estado: EstadoCotizacion;
  clienteId: string;
  vehiculoId: string;
  ordenId: string | null;
  cliente: string;
  placa: string;
  vehiculo: string;
  ordenFolio: string | null;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  observaciones: string | null;
  tokenPublico: string | null;
  fechaAprobacion: string | null;
  fechaCreacion: string;
}

export interface ResultadoListadoCotizaciones {
  items: CotizacionResumen[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

function aCotizacion(fila: cotizacionRepo.CotizacionFila): CotizacionResumen {
  return {
    id: fila.id,
    folio: fila.folio,
    estado: fila.estado as EstadoCotizacion,
    clienteId: fila.cliente_id,
    vehiculoId: fila.vehiculo_id,
    ordenId: fila.orden_id,
    cliente: fila.cliente_nombre ?? '—',
    placa: fila.placa ?? '—',
    vehiculo: fila.vehiculo_descripcion?.trim() ?? '—',
    ordenFolio: fila.orden_folio ?? null,
    subtotal: Number(fila.subtotal),
    impuestos: Number(fila.impuestos),
    descuento: Number(fila.descuento),
    total: Number(fila.total),
    observaciones: fila.observaciones,
    tokenPublico: fila.token_publico,
    fechaAprobacion: fila.fecha_aprobacion,
    fechaCreacion: fila.created_at,
  };
}

async function validarRelaciones(
  tallerId: string,
  clienteId: string,
  vehiculoId: string,
  ordenId?: string | null,
): Promise<void> {
  const cliente = await clienteRepo.buscarCliente(pool, tallerId, clienteId);
  if (!cliente) throw ApiError.badRequest('El cliente seleccionado no existe en tu taller.');

  const vehiculo = await vehiculoRepo.buscarVehiculo(pool, tallerId, vehiculoId);
  if (!vehiculo) throw ApiError.badRequest('El vehículo seleccionado no existe en tu taller.');
  if (vehiculo.cliente_id !== clienteId) {
    throw ApiError.badRequest('El vehículo seleccionado no pertenece a ese cliente.');
  }

  if (ordenId) {
    const orden = await ordenRepo.buscarOrden(pool, tallerId, ordenId);
    if (!orden) throw ApiError.badRequest('La orden seleccionada no existe en tu taller.');
    if (orden.cliente_id !== clienteId || orden.vehiculo_id !== vehiculoId) {
      throw ApiError.badRequest('La orden seleccionada no corresponde al cliente y vehículo indicados.');
    }
  }
}

export async function listarCotizaciones(
  tallerId: string,
  filtros: { estado?: string; busqueda?: string; pagina: number; porPagina: number },
): Promise<ResultadoListadoCotizaciones> {
  const { filas, total } = await cotizacionRepo.listarCotizaciones(pool, tallerId, filtros);
  return {
    items: filas.map(aCotizacion),
    total,
    pagina: filtros.pagina,
    totalPaginas: Math.max(1, Math.ceil(total / filtros.porPagina)),
  };
}

export async function obtenerCotizacion(tallerId: string, id: string): Promise<CotizacionResumen> {
  const fila = await cotizacionRepo.buscarCotizacion(pool, tallerId, id);
  if (!fila) throw ApiError.noEncontrado('Cotización no encontrada en tu taller.');
  return aCotizacion(fila);
}

export async function crearCotizacion(
  tallerId: string,
  datos: CrearCotizacionInput,
): Promise<CotizacionResumen> {
  await validarRelaciones(tallerId, datos.clienteId, datos.vehiculoId, datos.ordenId || null);

  const fila = await cotizacionRepo.crearCotizacionConFolio(tallerId, {
    clienteId: datos.clienteId,
    vehiculoId: datos.vehiculoId,
    ordenId: datos.ordenId || null,
    estado: datos.estado ?? 'BORRADOR',
    subtotal: datos.subtotal ?? 0,
    impuestos: datos.impuestos ?? 0,
    descuento: datos.descuento ?? 0,
    total: datos.total ?? 0,
    observaciones: datos.observaciones || null,
  });
  if (!fila) throw ApiError.badRequest('No se pudo crear la cotización.');
  return aCotizacion(fila);
}

export async function actualizarCotizacion(
  tallerId: string,
  id: string,
  cambios: ActualizarCotizacionInput,
): Promise<CotizacionResumen> {
  const existente = await cotizacionRepo.buscarCotizacion(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Cotización no encontrada en tu taller.');
  if (existente.estado === 'APROBADA' || existente.estado === 'RECHAZADA') {
    throw ApiError.conflicto('Una cotización aprobada o rechazada ya no puede modificarse.');
  }
  if (cambios.ordenId) {
    await validarRelaciones(tallerId, existente.cliente_id, existente.vehiculo_id, cambios.ordenId);
  }

  const estado = cambios.estado;
  const fila = await cotizacionRepo.actualizarCotizacion(pool, tallerId, id, {
    orden_id: cambios.ordenId === undefined ? undefined : cambios.ordenId || null,
    estado,
    subtotal: cambios.subtotal,
    impuestos: cambios.impuestos,
    descuento: cambios.descuento,
    total: cambios.total,
    observaciones: cambios.observaciones === undefined ? undefined : cambios.observaciones || null,
    fecha_aprobacion: estado === 'APROBADA' ? new Date().toISOString() : undefined,
  });
  if (!fila) throw ApiError.noEncontrado('Cotización no encontrada en tu taller.');
  return aCotizacion(fila);
}

export async function cambiarEstado(
  tallerId: string,
  id: string,
  estado: EstadoCotizacion,
): Promise<CotizacionResumen> {
  const existente = await cotizacionRepo.buscarCotizacion(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Cotización no encontrada en tu taller.');
  const fila = await cotizacionRepo.actualizarCotizacion(pool, tallerId, id, {
    estado,
    fecha_aprobacion: estado === 'APROBADA' ? new Date().toISOString() : null,
  });
  if (!fila) throw ApiError.noEncontrado('Cotización no encontrada en tu taller.');
  return aCotizacion(fila);
}

export async function contarPorEstado(tallerId: string): Promise<{ estado: string; cantidad: number }[]> {
  return cotizacionRepo.contarPorEstado(pool, tallerId);
}