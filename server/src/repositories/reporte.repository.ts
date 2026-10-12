import type { QueryExec } from '../config/db';

export interface FilaTopCliente {
  clienteId: string;
  cliente: string;
  ordenes: number;
  facturado: number;
  pagado: number;
  saldo: number;
}

export async function topClientes(db: QueryExec, tallerId: string, limite = 8): Promise<FilaTopCliente[]> {
  const { rows } = await db.query<{
    cliente_id: string;
    cliente: string;
    ordenes: string;
    facturado: string;
    pagado: string;
  }>(
    `WITH pagado_orden AS (
       SELECT orden_id, SUM(monto) AS pagado FROM pagos GROUP BY orden_id
     )
     SELECT
       c.id AS cliente_id,
       CONCAT(c.nombre, ' ', c.apellidos) AS cliente,
       COUNT(o.id) AS ordenes,
       COALESCE(SUM(o.total), 0) AS facturado,
       COALESCE(SUM(po.pagado), 0) AS pagado
     FROM clientes c
     JOIN ordenes_trabajo o ON o.cliente_id = c.id AND o.estado <> 'CANCELADO'
     LEFT JOIN pagado_orden po ON po.orden_id = o.id
     WHERE c.taller_id = $1
     GROUP BY c.id, c.nombre, c.apellidos
     ORDER BY facturado DESC
     LIMIT $2`,
    [tallerId, limite],
  );
  return rows.map((fila) => {
    const facturado = Number(fila.facturado);
    const pagado = Number(fila.pagado);
    return {
      clienteId: fila.cliente_id,
      cliente: fila.cliente,
      ordenes: Number(fila.ordenes),
      facturado,
      pagado,
      saldo: Math.max(facturado - pagado, 0),
    };
  });
}

export interface FilaIngresoMetodo {
  metodo: string;
  monto: number;
  cantidad: number;
}

export async function ingresosPorMetodo(db: QueryExec, tallerId: string): Promise<FilaIngresoMetodo[]> {
  const { rows } = await db.query<{ metodo: string; monto: string; cantidad: string }>(
    `SELECT metodo_pago AS metodo, SUM(monto) AS monto, COUNT(*) AS cantidad
     FROM pagos
     WHERE taller_id = $1
     GROUP BY metodo_pago
     ORDER BY monto DESC`,
    [tallerId],
  );
  return rows.map((fila) => ({
    metodo: fila.metodo,
    monto: Number(fila.monto),
    cantidad: Number(fila.cantidad),
  }));
}

export interface FilaResumenCotizaciones {
  total: number;
  enviadas: number;
  aprobadas: number;
  rechazadas: number;
  montoAprobado: number;
  montoEnviado: number;
}

export async function resumenCotizaciones(db: QueryExec, tallerId: string): Promise<FilaResumenCotizaciones> {
  const { rows } = await db.query<{
    total: string;
    enviadas: string;
    aprobadas: string;
    rechazadas: string;
    monto_aprobado: string;
    monto_enviado: string;
  }>(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE estado = 'ENVIADA') AS enviadas,
       COUNT(*) FILTER (WHERE estado = 'APROBADA') AS aprobadas,
       COUNT(*) FILTER (WHERE estado = 'RECHAZADA') AS rechazadas,
       COALESCE(SUM(total) FILTER (WHERE estado = 'APROBADA'), 0) AS monto_aprobado,
       COALESCE(SUM(total) FILTER (WHERE estado = 'ENVIADA'), 0) AS monto_enviado
     FROM cotizaciones
     WHERE taller_id = $1`,
    [tallerId],
  );
  const fila = rows[0];
  return {
    total: Number(fila?.total ?? 0),
    enviadas: Number(fila?.enviadas ?? 0),
    aprobadas: Number(fila?.aprobadas ?? 0),
    rechazadas: Number(fila?.rechazadas ?? 0),
    montoAprobado: Number(fila?.monto_aprobado ?? 0),
    montoEnviado: Number(fila?.monto_enviado ?? 0),
  };
}

export interface FilaOrdenMes {
  mes: string;
  ordenes: number;
  facturado: number;
}

export async function ordenesPorMes(db: QueryExec, tallerId: string): Promise<FilaOrdenMes[]> {
  const { rows } = await db.query<{ mes: string; ordenes: string; facturado: string }>(
    `SELECT
       to_char(m.mes, 'YYYY-MM') AS mes,
       COUNT(o.id) AS ordenes,
       COALESCE(SUM(o.total), 0) AS facturado
     FROM generate_series(
       date_trunc('month', NOW()) - interval '5 months',
       date_trunc('month', NOW()),
       interval '1 month'
     ) AS m(mes)
     LEFT JOIN ordenes_trabajo o
       ON o.taller_id = $1
      AND date_trunc('month', o.fecha_ingreso) = m.mes
      AND o.estado <> 'CANCELADO'
     GROUP BY m.mes
     ORDER BY m.mes`,
    [tallerId],
  );
  return rows.map((fila) => ({
    mes: fila.mes,
    ordenes: Number(fila.ordenes),
    facturado: Number(fila.facturado),
  }));
}

export interface FilaTopMecanico {
  mecanicoId: string;
  mecanico: string;
  ordenes: number;
  facturado: number;
}

export async function topMecanicos(db: QueryExec, tallerId: string, limite = 5): Promise<FilaTopMecanico[]> {
  const { rows } = await db.query<{ mecanico_id: string; mecanico: string; ordenes: string; facturado: string }>(
    `SELECT
       u.id AS mecanico_id,
       CONCAT(u.nombre, ' ', u.apellidos) AS mecanico,
       COUNT(o.id) AS ordenes,
       COALESCE(SUM(o.total), 0) AS facturado
     FROM usuarios u
     JOIN ordenes_trabajo o ON o.mecanico_id = u.id AND o.estado <> 'CANCELADO'
     WHERE u.taller_id = $1
     GROUP BY u.id, u.nombre, u.apellidos
     ORDER BY ordenes DESC
     LIMIT $2`,
    [tallerId, limite],
  );
  return rows.map((fila) => ({
    mecanicoId: fila.mecanico_id,
    mecanico: fila.mecanico,
    ordenes: Number(fila.ordenes),
    facturado: Number(fila.facturado),
  }));
}
