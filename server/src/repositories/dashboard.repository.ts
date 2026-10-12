import type { QueryExec } from '../config/db';

export interface FilaEstadisticas {
  ordenes_activas: number;
  vehiculos_listos: number;
}

export interface FilaIngresoMensual {
  mes: string;
  total: number;
}

export interface FilaEstadoOrden {
  estado: string;
  cantidad: number;
}

export interface FilaTrabajoReciente {
  id: string;
  folio: string;
  estado: string;
  total: number;
  fecha_ingreso: string;
  cliente: string;
  placa: string;
  vehiculo: string;
  mecanico: string | null;
}

export async function obtenerEstadisticas(
  db: QueryExec,
  tallerId: string,
): Promise<FilaEstadisticas> {
  const { rows } = await db.query<FilaEstadisticas>(
    `SELECT
       COUNT(*) FILTER (WHERE estado NOT IN ('ENTREGADO', 'CANCELADO')) AS ordenes_activas,
       COUNT(*) FILTER (WHERE estado = 'LISTO') AS vehiculos_listos
     FROM ordenes_trabajo
     WHERE taller_id = $1`,
    [tallerId],
  );
  return rows[0];
}

export async function obtenerCotizacionesPendientes(
  db: QueryExec,
  tallerId: string,
): Promise<number> {
  const { rows } = await db.query<{ cantidad: number }>(
    `SELECT COUNT(*)::int AS cantidad
     FROM cotizaciones
     WHERE taller_id = $1 AND estado = 'ENVIADA'`,
    [tallerId],
  );
  return rows[0]?.cantidad ?? 0;
}

export async function obtenerPagosPendientes(
  db: QueryExec,
  tallerId: string,
): Promise<number> {
  const { rows } = await db.query<{ pendiente: number }>(
    `SELECT COALESCE(SUM(GREATEST(o.total - COALESCE(p.pagado, 0), 0)), 0) AS pendiente
     FROM ordenes_trabajo o
     LEFT JOIN (
       SELECT orden_id, SUM(monto) AS pagado
       FROM pagos
       GROUP BY orden_id
     ) p ON p.orden_id = o.id
     WHERE o.taller_id = $1 AND o.estado <> 'CANCELADO'`,
    [tallerId],
  );
  return Number(rows[0]?.pendiente ?? 0);
}

export async function obtenerIngresosDelMes(db: QueryExec, tallerId: string): Promise<number> {
  const { rows } = await db.query<{ total: number }>(
    `SELECT COALESCE(SUM(monto), 0) AS total
     FROM pagos
     WHERE taller_id = $1 AND fecha_pago >= date_trunc('month', NOW())`,
    [tallerId],
  );
  return Number(rows[0]?.total ?? 0);
}

export async function obtenerIngresos6Meses(
  db: QueryExec,
  tallerId: string,
): Promise<FilaIngresoMensual[]> {
  const { rows } = await db.query<FilaIngresoMensual>(
    `SELECT
       to_char(m.mes, 'YYYY-MM') AS mes,
       COALESCE(SUM(p.monto), 0) AS total
     FROM generate_series(
       date_trunc('month', NOW()) - interval '5 months',
       date_trunc('month', NOW()),
       interval '1 month'
     ) AS m(mes)
     LEFT JOIN pagos p
       ON p.taller_id = $1
      AND date_trunc('month', p.fecha_pago) = m.mes
     GROUP BY m.mes
     ORDER BY m.mes`,
    [tallerId],
  );
  return rows;
}

export async function obtenerOrdenesPorEstado(
  db: QueryExec,
  tallerId: string,
): Promise<FilaEstadoOrden[]> {
  const { rows } = await db.query<FilaEstadoOrden>(
    `SELECT estado, COUNT(*)::int AS cantidad
     FROM ordenes_trabajo
     WHERE taller_id = $1
     GROUP BY estado
     ORDER BY cantidad DESC, estado ASC`,
    [tallerId],
  );
  return rows;
}

export async function obtenerTrabajosRecientes(
  db: QueryExec,
  tallerId: string,
  limite = 8,
): Promise<FilaTrabajoReciente[]> {
  const { rows } = await db.query<FilaTrabajoReciente>(
    `SELECT
       o.id,
       o.folio,
       o.estado,
       o.total,
       o.fecha_ingreso,
       CONCAT(c.nombre, ' ', c.apellidos) AS cliente,
       v.placa,
       CONCAT(v.marca, ' ', v.modelo, ' ', v.anio) AS vehiculo,
       CONCAT(m.nombre, ' ', m.apellidos) AS mecanico
     FROM ordenes_trabajo o
     JOIN clientes c ON c.id = o.cliente_id
     JOIN vehiculos v ON v.id = o.vehiculo_id
     LEFT JOIN usuarios m ON m.id = o.mecanico_id
     WHERE o.taller_id = $1
     ORDER BY o.fecha_ingreso DESC, o.created_at DESC
     LIMIT $2`,
    [tallerId, limite],
  );
  return rows;
}
