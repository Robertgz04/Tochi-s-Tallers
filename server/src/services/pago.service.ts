import { pool } from '../config/db';
import * as pagoRepo from '../repositories/pago.repository';
import * as ordenRepo from '../repositories/orden.repository';
import { ApiError } from '../utils/ApiError';
import type { CrearPagoInput, MetodoPago } from '../validators/pago.validators';

export interface PagoResumen {
  id: string;
  ordenId: string;
  clienteId: string;
  ordenFolio: string;
  cliente: string;
  vehiculo: string;
  placa: string;
  monto: number;
  metodoPago: MetodoPago;
  referencia: string | null;
  fechaPago: string;
  observaciones: string | null;
  ordenTotal: number;
  ordenPagado: number;
  saldo: number;
}

export interface ResultadoListadoPagos {
  items: PagoResumen[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

function aPago(fila: pagoRepo.PagoFila): PagoResumen {
  const ordenTotal = Number(fila.orden_total ?? 0);
  const ordenPagado = Number(fila.orden_pagado ?? 0);
  return {
    id: fila.id,
    ordenId: fila.orden_id,
    clienteId: fila.cliente_id,
    ordenFolio: fila.orden_folio ?? '—',
    cliente: fila.cliente_nombre ?? '—',
    vehiculo: fila.vehiculo_descripcion?.trim() ?? '—',
    placa: fila.placa ?? '—',
    monto: Number(fila.monto),
    metodoPago: fila.metodo_pago as MetodoPago,
    referencia: fila.referencia,
    fechaPago: fila.fecha_pago,
    observaciones: fila.observaciones,
    ordenTotal,
    ordenPagado,
    saldo: Math.max(ordenTotal - ordenPagado, 0),
  };
}

export async function listarPagos(
  tallerId: string,
  filtros: { busqueda?: string; pagina: number; porPagina: number },
): Promise<ResultadoListadoPagos> {
  const { filas, total } = await pagoRepo.listarPagos(pool, tallerId, filtros);
  return {
    items: filas.map(aPago),
    total,
    pagina: filtros.pagina,
    totalPaginas: Math.max(1, Math.ceil(total / filtros.porPagina)),
  };
}

export async function crearPago(tallerId: string, datos: CrearPagoInput): Promise<PagoResumen> {
  const orden = await ordenRepo.buscarOrden(pool, tallerId, datos.ordenId);
  if (!orden) throw ApiError.badRequest('La orden seleccionada no existe en tu taller.');
  if (orden.estado === 'CANCELADO') throw ApiError.conflicto('No puedes registrar pagos en una orden cancelada.');

  const pagado = Number(orden.pagado ?? 0);
  const total = Number(orden.total ?? 0);
  if (total > 0 && pagado + Number(datos.monto) > total) {
    throw ApiError.badRequest('El pago excede el saldo pendiente de la orden.');
  }

  const fila = await pagoRepo.crearPago(pool, tallerId, {
    ordenId: datos.ordenId,
    clienteId: orden.cliente_id,
    monto: Number(datos.monto),
    metodoPago: datos.metodoPago,
    referencia: datos.referencia || null,
    fechaPago: datos.fechaPago || null,
    observaciones: datos.observaciones || null,
  });
  if (!fila) throw ApiError.badRequest('No se pudo registrar el pago.');
  return aPago(fila);
}

export async function eliminarPago(tallerId: string, id: string): Promise<void> {
  const existe = await pagoRepo.buscarPago(pool, tallerId, id);
  if (!existe) throw ApiError.noEncontrado('Pago no encontrado en tu taller.');
  const eliminado = await pagoRepo.eliminarPago(pool, tallerId, id);
  if (!eliminado) throw ApiError.noEncontrado('Pago no encontrado en tu taller.');
}