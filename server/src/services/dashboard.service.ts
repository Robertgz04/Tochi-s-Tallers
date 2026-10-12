import { pool } from '../config/db';
import * as dashRepo from '../repositories/dashboard.repository';
import type { DashboardData } from '../types/dashboard';

export async function obtenerDashboard(tallerId: string): Promise<DashboardData> {
  const [
    estadisticas,
    cotizacionesPendientes,
    pagosPendientes,
    ingresosMes,
    ingresosMensuales,
    ordenesPorEstado,
    trabajosRecientes,
  ] = await Promise.all([
    dashRepo.obtenerEstadisticas(pool, tallerId),
    dashRepo.obtenerCotizacionesPendientes(pool, tallerId),
    dashRepo.obtenerPagosPendientes(pool, tallerId),
    dashRepo.obtenerIngresosDelMes(pool, tallerId),
    dashRepo.obtenerIngresos6Meses(pool, tallerId),
    dashRepo.obtenerOrdenesPorEstado(pool, tallerId),
    dashRepo.obtenerTrabajosRecientes(pool, tallerId),
  ]);

  return {
    stats: {
      ordenesActivas: Number(estadisticas.ordenes_activas ?? 0),
      vehiculosListos: Number(estadisticas.vehiculos_listos ?? 0),
      cotizacionesPendientes,
      pagosPendientes,
      ingresosMes,
    },
    ingresosMensuales: ingresosMensuales.map((fila) => ({
      mes: fila.mes,
      total: Number(fila.total),
    })),
    ordenesPorEstado: ordenesPorEstado.map((fila) => ({
      estado: fila.estado,
      cantidad: Number(fila.cantidad),
    })),
    trabajosRecientes: trabajosRecientes.map((fila) => ({
      id: fila.id,
      folio: fila.folio,
      estado: fila.estado,
      total: Number(fila.total),
      fechaIngreso: fila.fecha_ingreso,
      cliente: fila.cliente,
      placa: fila.placa,
      vehiculo: fila.vehiculo,
      mecanico: fila.mecanico,
    })),
  };
}
