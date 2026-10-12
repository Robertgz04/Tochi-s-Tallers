import { pool } from '../config/db';
import * as ordenRepo from '../repositories/orden.repository';
import * as clienteRepo from '../repositories/cliente.repository';
import * as vehiculoRepo from '../repositories/vehiculo.repository';
import * as tallerRepo from '../repositories/taller.repository';
import { ApiError } from '../utils/ApiError';
import type { EstadoOrden } from '../types/orden';
import type { CrearOrdenInput, ActualizarOrdenInput } from '../validators/orden.validators';

export interface OrdenResumen {
  id: string;
  folio: string;
  estado: EstadoOrden;
  fechaIngreso: string;
  fechaEstimada: string | null;
  fechaFinalizacion: string | null;
  cliente: string;
  placa: string;
  vehiculo: string;
  mecanico: string | null;
  total: number;
  kilometrajeEntrada: number;
}

export interface OrdenDetalle extends OrdenResumen {
  clienteId: string;
  vehiculoId: string;
  mecanicoId: string | null;
  nivelCombustible: string;
  descripcionCliente: string;
  diagnostico: string | null;
  observaciones: string | null;
  subtotal: number;
  impuestos: number;
  descuento: number;
  pagado: number;
}

function aResumen(fila: ordenRepo.OrdenFila): OrdenResumen {
  return {
    id: fila.id,
    folio: fila.folio,
    estado: fila.estado as EstadoOrden,
    fechaIngreso: fila.fecha_ingreso,
    fechaEstimada: fila.fecha_estimada,
    fechaFinalizacion: fila.fecha_finalizacion,
    cliente: fila.cliente_nombre ?? '—',
    placa: fila.placa ?? '—',
    vehiculo: fila.vehiculo_descripcion?.trim() ?? '—',
    mecanico: fila.mecanico_nombre ?? null,
    total: Number(fila.total),
    kilometrajeEntrada: fila.kilometraje_entrada,
  };
}

function aDetalle(fila: ordenRepo.OrdenFila): OrdenDetalle {
  return {
    ...aResumen(fila),
    clienteId: fila.cliente_id,
    vehiculoId: fila.vehiculo_id,
    mecanicoId: fila.mecanico_id,
    nivelCombustible: fila.nivel_combustible,
    descripcionCliente: fila.descripcion_cliente,
    diagnostico: fila.diagnostico,
    observaciones: fila.observaciones,
    subtotal: Number(fila.subtotal),
    impuestos: Number(fila.impuestos),
    descuento: Number(fila.descuento),
    pagado: Number(fila.pagado ?? 0),
  };
}

export interface ResultadoListadoOrdenes {
  items: OrdenResumen[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

interface FiltrosOrdenes {
  estado?: string;
  busqueda?: string;
  pagina: number;
  porPagina: number;
}

export async function listarOrdenes(
  tallerId: string,
  filtros: FiltrosOrdenes,
): Promise<ResultadoListadoOrdenes> {
  const { filas, total } = await ordenRepo.listarOrdenes(pool, tallerId, filtros);
  return {
    items: filas.map(aResumen),
    total,
    pagina: filtros.pagina,
    totalPaginas: Math.max(1, Math.ceil(total / filtros.porPagina)),
  };
}

async function verificarMecanico(tallerId: string, mecanicoId: string): Promise<void> {
  const mecanico = await pool.query<{ id: string }>(
    'SELECT id FROM usuarios WHERE id = $1 AND taller_id = $2 LIMIT 1',
    [mecanicoId, tallerId],
  );
  if (!mecanico.rows[0]) {
    throw ApiError.badRequest('El mecánico seleccionado no pertenece a tu taller.');
  }
}

export async function crearOrden(tallerId: string, datos: CrearOrdenInput): Promise<OrdenDetalle> {
  const cliente = await clienteRepo.buscarCliente(pool, tallerId, datos.clienteId);
  if (!cliente) throw ApiError.noEncontrado('El cliente seleccionado no existe en tu taller.');

  const vehiculo = await vehiculoRepo.buscarVehiculo(pool, tallerId, datos.vehiculoId);
  if (!vehiculo) throw ApiError.noEncontrado('El vehículo seleccionado no existe en tu taller.');
  if (vehiculo.cliente_id !== datos.clienteId) {
    throw ApiError.badRequest('El vehículo seleccionado no pertenece a ese cliente.');
  }
  if (datos.mecanicoId) await verificarMecanico(tallerId, datos.mecanicoId);

  const taller = await tallerRepo.buscarTallerPorId(pool, tallerId);
  const prefijo = taller?.prefijo_folio ?? 'ORD';

  const fila = await ordenRepo.crearOrdenConFolio(tallerId, prefijo, {
    clienteId: datos.clienteId,
    vehiculoId: datos.vehiculoId,
    mecanicoId: datos.mecanicoId || null,
    fechaEstimada: datos.fechaEstimada || null,
    kilometrajeEntrada: datos.kilometrajeEntrada ?? vehiculo.kilometraje,
    nivelCombustible: datos.nivelCombustible ?? 'MITAD',
    descripcionCliente: datos.descripcionCliente,
    diagnostico: datos.diagnostico || null,
  });
  if (!fila) throw ApiError.badRequest('No se pudo crear la orden.');
  return aDetalle(fila);
}

export async function actualizarOrden(
  tallerId: string,
  id: string,
  cambios: ActualizarOrdenInput,
): Promise<OrdenDetalle> {
  const existente = await ordenRepo.buscarOrden(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Orden no encontrada en tu taller.');
  if (existente.estado === 'ENTREGADO' || existente.estado === 'CANCELADO') {
    throw ApiError.conflicto(
      `Una orden ${existente.estado === 'ENTREGADO' ? 'entregada' : 'cancelada'} ya no puede modificarse.`,
    );
  }
  if (cambios.mecanicoId) await verificarMecanico(tallerId, cambios.mecanicoId);

  const fila = await ordenRepo.actualizarOrden(pool, tallerId, id, {
    mecanico_id: cambios.mecanicoId === undefined ? undefined : cambios.mecanicoId || null,
    fecha_estimada: cambios.fechaEstimada === undefined ? undefined : cambios.fechaEstimada || null,
    fecha_finalizacion:
      cambios.fechaFinalizacion === undefined ? undefined : cambios.fechaFinalizacion || null,
    nivel_combustible: cambios.nivelCombustible,
    descripcion_cliente: cambios.descripcionCliente,
    diagnostico: cambios.diagnostico === undefined ? undefined : cambios.diagnostico || null,
    observaciones: cambios.observaciones === undefined ? undefined : cambios.observaciones || null,
    subtotal: cambios.subtotal,
    impuestos: cambios.impuestos,
    descuento: cambios.descuento,
    total: cambios.total,
  });
  if (!fila) throw ApiError.noEncontrado('Orden no encontrada en tu taller.');
  return aDetalle(fila);
}

export async function cambiarEstado(
  tallerId: string,
  id: string,
  estado: EstadoOrden,
): Promise<OrdenDetalle> {
  const existente = await ordenRepo.buscarOrden(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Orden no encontrada en tu taller.');
  if (existente.estado === 'ENTREGADO' && estado !== 'ENTREGADO') {
    throw ApiError.conflicto('Una orden entregada no puede regresar a otro estado.');
  }

  const fila = await ordenRepo.cambiarEstadoOrden(pool, tallerId, id, estado);
  if (!fila) throw ApiError.noEncontrado('Orden no encontrada en tu taller.');
  return aDetalle(fila);
}

export async function obtenerOrden(tallerId: string, id: string): Promise<OrdenDetalle> {
  const fila = await ordenRepo.buscarOrden(pool, tallerId, id);
  if (!fila) throw ApiError.noEncontrado('Orden no encontrada en tu taller.');
  return aDetalle(fila);
}

export async function contarPorEstado(
  tallerId: string,
): Promise<{ estado: string; cantidad: number }[]> {
  return ordenRepo.contarPorEstado(pool, tallerId);
}
