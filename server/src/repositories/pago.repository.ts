import type { QueryExec } from '../config/db';

export interface PagoFila {
  id: string;
  taller_id: string;
  orden_id: string;
  cliente_id: string;
  monto: number;
  metodo_pago: string;
  referencia: string | null;
  fecha_pago: string;
  observaciones: string | null;
  created_at: string;
  orden_folio?: string;
  cliente_nombre?: string;
  vehiculo_descripcion?: string;
  placa?: string;
  orden_total?: number;
  orden_pagado?: number;
}

const COLUMNAS_LISTADO = `
  p.id, p.taller_id, p.orden_id, p.cliente_id, p.monto, p.metodo_pago, p.referencia,
  p.fecha_pago, p.observaciones, p.created_at,
  o.folio AS orden_folio,
  CONCAT(c.nombre, ' ', c.apellidos) AS cliente_nombre,
  CONCAT(v.marca, ' ', v.modelo, ' ', COALESCE(v.anio::text, '')) AS vehiculo_descripcion,
  v.placa,
  o.total AS orden_total,
  (SELECT COALESCE(SUM(px.monto), 0) FROM pagos px WHERE px.orden_id = p.orden_id) AS orden_pagado`;

export interface OpcionesListadoPagos {
  busqueda?: string;
  pagina: number;
  porPagina: number;
}

export async function listarPagos(
  db: QueryExec,
  tallerId: string,
  opciones: OpcionesListadoPagos,
): Promise<{ filas: PagoFila[]; total: number }> {
  const parametros: unknown[] = [tallerId];
  let filtro = '';
  if (opciones.busqueda?.trim()) {
    parametros.push(`%${opciones.busqueda.trim()}%`);
    filtro = ` AND (
      lower(o.folio) LIKE lower($2)
      OR lower(c.nombre || ' ' || c.apellidos) LIKE lower($2)
      OR lower(v.placa) LIKE lower($2)
      OR lower(COALESCE(p.referencia, '')) LIKE lower($2)
    )`;
  }

  const { rows: conteo } = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM pagos p
     JOIN ordenes_trabajo o ON o.id = p.orden_id
     JOIN clientes c ON c.id = p.cliente_id
     JOIN vehiculos v ON v.id = o.vehiculo_id
     WHERE p.taller_id = $1 ${filtro}`,
    parametros,
  );

  parametros.push(opciones.porPagina);
  const limite = `$${parametros.length}`;
  parametros.push((opciones.pagina - 1) * opciones.porPagina);
  const offset = `$${parametros.length}`;

  const { rows } = await db.query<PagoFila>(
    `SELECT ${COLUMNAS_LISTADO}
     FROM pagos p
     JOIN ordenes_trabajo o ON o.id = p.orden_id
     JOIN clientes c ON c.id = p.cliente_id
     JOIN vehiculos v ON v.id = o.vehiculo_id
     WHERE p.taller_id = $1 ${filtro}
     ORDER BY p.fecha_pago DESC, p.created_at DESC
     LIMIT ${limite} OFFSET ${offset}`,
    parametros,
  );

  return { filas: rows, total: Number(conteo[0]?.total ?? 0) };
}

export async function buscarPago(db: QueryExec, tallerId: string, id: string): Promise<PagoFila | null> {
  const { rows } = await db.query<PagoFila>(
    `SELECT ${COLUMNAS_LISTADO}
     FROM pagos p
     JOIN ordenes_trabajo o ON o.id = p.orden_id
     JOIN clientes c ON c.id = p.cliente_id
     JOIN vehiculos v ON v.id = o.vehiculo_id
     WHERE p.id = $1 AND p.taller_id = $2
     LIMIT 1`,
    [id, tallerId],
  );
  return rows[0] ?? null;
}

export interface DatosNuevoPago {
  ordenId: string;
  clienteId: string;
  monto: number;
  metodoPago: string;
  referencia: string | null;
  fechaPago: string | null;
  observaciones: string | null;
}

export async function crearPago(
  db: QueryExec,
  tallerId: string,
  datos: DatosNuevoPago,
): Promise<PagoFila | null> {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO pagos (taller_id, orden_id, cliente_id, monto, metodo_pago, referencia, fecha_pago, observaciones)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, NOW()), $8)
     RETURNING id`,
    [
      tallerId,
      datos.ordenId,
      datos.clienteId,
      datos.monto,
      datos.metodoPago,
      datos.referencia,
      datos.fechaPago,
      datos.observaciones,
    ],
  );
  if (!rows[0]) return null;
  return buscarPago(db, tallerId, rows[0].id);
}

export async function eliminarPago(db: QueryExec, tallerId: string, id: string): Promise<boolean> {
  const { rowCount } = await db.query('DELETE FROM pagos WHERE id = $1 AND taller_id = $2', [id, tallerId]);
  return (rowCount ?? 0) > 0;
}