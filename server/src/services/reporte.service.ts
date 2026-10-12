import { pool } from '../config/db';
import * as reporteRepo from '../repositories/reporte.repository';
import * as dashRepo from '../repositories/dashboard.repository';

export interface ResumenReportes {
  totales: {
    clientes: number;
    vehiculos: number;
    ordenes: number;
    ordenesEntregadas: number;
    facturado: number;
    cobrado: number;
    porCobrar: number;
    ingresosMes: number;
  };
  ingresosMensuales: { mes: string; total: number }[];
  ordenesPorMes: { mes: string; ordenes: number; facturado: number }[];
  ordenesPorEstado: { estado: string; cantidad: number }[];
  ingresosPorMetodo: { metodo: string; monto: number; cantidad: number }[];
  topClientes: {
    clienteId: string;
    cliente: string;
    ordenes: number;
    facturado: number;
    pagado: number;
    saldo: number;
  }[];
  topMecanicos: { mecanicoId: string; mecanico: string; ordenes: number; facturado: number }[];
  cotizaciones: {
    total: number;
    enviadas: number;
    aprobadas: number;
    rechazadas: number;
    montoAprobado: number;
    montoEnviado: number;
  };
}

export async function obtenerResumen(tallerId: string): Promise<ResumenReportes> {
  const [
    totalesFila,
    ingresosMensuales,
    ordenesPorMes,
    ordenesPorEstado,
    ingresosPorMetodo,
    topClientes,
    topMecanicos,
    cotizaciones,
    porCobrar,
    ingresosMes,
  ] = await Promise.all([
    pool.query<{
      clientes: string;
      vehiculos: string;
      ordenes: string;
      entregadas: string;
      facturado: string;
      cobrado: string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM clientes WHERE taller_id = $1) AS clientes,
         (SELECT COUNT(*) FROM vehiculos WHERE taller_id = $1) AS vehiculos,
         (SELECT COUNT(*) FROM ordenes_trabajo WHERE taller_id = $1) AS ordenes,
         (SELECT COUNT(*) FROM ordenes_trabajo WHERE taller_id = $1 AND estado = 'ENTREGADO') AS entregadas,
         (SELECT COALESCE(SUM(total), 0) FROM ordenes_trabajo WHERE taller_id = $1 AND estado <> 'CANCELADO') AS facturado,
         (SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE taller_id = $1) AS cobrado`,
      [tallerId],
    ),
    dashRepo.obtenerIngresos6Meses(pool, tallerId),
    reporteRepo.ordenesPorMes(pool, tallerId),
    dashRepo.obtenerOrdenesPorEstado(pool, tallerId),
    reporteRepo.ingresosPorMetodo(pool, tallerId),
    reporteRepo.topClientes(pool, tallerId),
    reporteRepo.topMecanicos(pool, tallerId),
    reporteRepo.resumenCotizaciones(pool, tallerId),
    dashRepo.obtenerPagosPendientes(pool, tallerId),
    dashRepo.obtenerIngresosDelMes(pool, tallerId),
  ]);

  const t = totalesFila.rows[0];
  return {
    totales: {
      clientes: Number(t?.clientes ?? 0),
      vehiculos: Number(t?.vehiculos ?? 0),
      ordenes: Number(t?.ordenes ?? 0),
      ordenesEntregadas: Number(t?.entregadas ?? 0),
      facturado: Number(t?.facturado ?? 0),
      cobrado: Number(t?.cobrado ?? 0),
      porCobrar,
      ingresosMes,
    },
    ingresosMensuales: ingresosMensuales.map((f) => ({ mes: f.mes, total: Number(f.total) })),
    ordenesPorMes,
    ordenesPorEstado: ordenesPorEstado.map((f) => ({ estado: f.estado, cantidad: Number(f.cantidad) })),
    ingresosPorMetodo,
    topClientes,
    topMecanicos,
    cotizaciones,
  };
}
