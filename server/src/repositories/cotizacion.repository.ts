import { withTransaction, type QueryExec } from '../config/db';

export interface CotizacionFila {
  id: string;
  folio: string;
  taller_id: string;
  cliente_id: string;
  vehiculo_id: string;
  orden_id: string | null;
  estado: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  observaciones: string | null;
  token_publico: string | null;
  fecha_aprobacion: string | null;
  created_at: string;
  updated_at: string;
  cliente_nombre?: string;
  placa?: string;
  vehiculo_descripcion?: string;
  orden_folio?: string | null;
}

const COLUMNAS_LISTADO = `
  c.id, c.folio, c.taller_id, c.cliente_id, c.vehiculo_id, c.orden_id, c.estado,
  c.subtotal, c.impuestos, c.descuento, c.total, c.observaciones, c.token_publico,
  c.fecha_aprobacion, c.created_at, c.updated_at,
  CONCAT(cli.nombre, ' ', cli.apellidos) AS cliente_nombre,
  v.placa,
  CONCAT(v.marca, ' ', v.modelo, ' ', COALESCE(v.anio::text, '')) AS vehiculo_descripcion,
  o.folio AS orden_folio`;

export interface OpcionesListadoCotizaciones {
  estado?: string;
  busqueda?: string;
  pagina: number;
  porPagina: number;
}

export async function listarCotizaciones(
  db: QueryExec,
  tallerId: string,
  opciones: OpcionesListadoCotizaciones,
): Promise<{ filas: CotizacionFila[]; total: number }> {
  const parametros: unknown[] = [tallerId];
  let filtro = '';

  if (opciones.estado) {
    parametros.push(opciones.estado);
    filtro += ` AND c.estado = $${parametros.length}`;
  }
  if (opciones.busqueda?.trim()) {
    parametros.push(`%${opciones.busqueda.trim()}%`);
    filtro += ` AND (
      lower(c.folio) LIKE lower($${parametros.length})
      OR lower(cli.nombre || ' ' || cli.apellidos) LIKE lower($${parametros.length})
      OR lower(v.placa) LIKE lower($${parametros.length})
      OR lower(v.marca || ' ' || v.modelo) LIKE lower($${parametros.length})
      OR lower(COALESCE(o.folio, '')) LIKE lower($${parametros.length})
    )`;
  }

  const { rows: conteo } = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM cotizaciones c
     JOIN clientes cli ON cli.id = c.cliente_id
     JOIN vehiculos v ON v.id = c.vehiculo_id
     LEFT JOIN ordenes_trabajo o ON o.id = c.orden_id
     WHERE c.taller_id = $1 ${filtro}`,
    parametros,
  );

  parametros.push(opciones.porPagina);
  const limite = `$${parametros.length}`;
  parametros.push((opciones.pagina - 1) * opciones.porPagina);
  const offset = `$${parametros.length}`;

  const { rows } = await db.query<CotizacionFila>(
    `SELECT ${COLUMNAS_LISTADO}
     FROM cotizaciones c
     JOIN clientes cli ON cli.id = c.cliente_id
     JOIN vehiculos v ON v.id = c.vehiculo_id
     LEFT JOIN ordenes_trabajo o ON o.id = c.orden_id
     WHERE c.taller_id = $1 ${filtro}
     ORDER BY c.created_at DESC
     LIMIT ${limite} OFFSET ${offset}`,
    parametros,
  );

  return { filas: rows, total: Number(conteo[0]?.total ?? 0) };
}

export async function buscarCotizacion(
  db: QueryExec,
  tallerId: string,
  id: string,
): Promise<CotizacionFila | null> {
  const { rows } = await db.query<CotizacionFila>(
    `SELECT ${COLUMNAS_LISTADO}
     FROM cotizaciones c
     JOIN clientes cli ON cli.id = c.cliente_id
     JOIN vehiculos v ON v.id = c.vehiculo_id
     LEFT JOIN ordenes_trabajo o ON o.id = c.orden_id
     WHERE c.id = $1 AND c.taller_id = $2
     LIMIT 1`,
    [id, tallerId],
  );
  return rows[0] ?? null;
}

export interface DatosNuevaCotizacion {
  clienteId: string;
  vehiculoId: string;
  ordenId: string | null;
  estado: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  observaciones: string | null;
}

async function siguienteFolio(cliente: QueryExec, tallerId: string): Promise<string> {
  const { rows } = await cliente.query<{ consecutivo: string }>(
    `SELECT COALESCE(MAX((regexp_match(folio, '[0-9]+$'))[1]::int), 0) + 1 AS consecutivo
     FROM cotizaciones
     WHERE taller_id = $1`,
    [tallerId],
  );
  return `COT-${String(Number(rows[0]?.consecutivo ?? 1)).padStart(6, '0')}`;
}

export async function crearCotizacionConFolio(
  tallerId: string,
  datos: DatosNuevaCotizacion,
): Promise<CotizacionFila | null> {
  return withTransaction(async (cliente) => {
    const folio = await siguienteFolio(cliente, tallerId);
    const token = `cot-${crypto.randomUUID().replace(/-/g, '')}`;
    const { rows } = await cliente.query<{ id: string }>(
      `INSERT INTO cotizaciones (
         folio, taller_id, cliente_id, vehiculo_id, orden_id, estado,
         subtotal, impuestos, descuento, total, observaciones, token_publico
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        folio,
        tallerId,
        datos.clienteId,
        datos.vehiculoId,
        datos.ordenId,
        datos.estado,
        datos.subtotal,
        datos.impuestos,
        datos.descuento,
        datos.total,
        datos.observaciones,
        token,
      ],
    );
    if (!rows[0]) return null;
    return buscarCotizacion(cliente, tallerId, rows[0].id);
  });
}

export interface CamposCotizacion {
  orden_id?: string | null;
  estado?: string;
  subtotal?: number;
  impuestos?: number;
  descuento?: number;
  total?: number;
  observaciones?: string | null;
  fecha_aprobacion?: string | null;
}

const COLUMNAS_ACTUALIZABLES: Record<keyof CamposCotizacion, string> = {
  orden_id: 'orden_id',
  estado: 'estado',
  subtotal: 'subtotal',
  impuestos: 'impuestos',
  descuento: 'descuento',
  total: 'total',
  observaciones: 'observaciones',
  fecha_aprobacion: 'fecha_aprobacion',
};

export async function actualizarCotizacion(
  db: QueryExec,
  tallerId: string,
  id: string,
  campos: CamposCotizacion,
): Promise<CotizacionFila | null> {
  const definidos = (Object.keys(COLUMNAS_ACTUALIZABLES) as (keyof CamposCotizacion)[]).filter(
    (clave) => campos[clave] !== undefined,
  );
  if (definidos.length === 0) return null;

  const asignaciones = definidos.map((clave, indice) => `${COLUMNAS_ACTUALIZABLES[clave]} = $${indice + 3}`);
  const valores = definidos.map((clave) => campos[clave]);
  const { rows } = await db.query<{ id: string }>(
    `UPDATE cotizaciones
     SET ${asignaciones.join(', ')}, updated_at = NOW()
     WHERE id = $1 AND taller_id = $2
     RETURNING id`,
    [id, tallerId, ...valores],
  );
  if (!rows[0]) return null;
  return buscarCotizacion(db, tallerId, rows[0].id);
}

export async function contarPorEstado(
  db: QueryExec,
  tallerId: string,
): Promise<{ estado: string; cantidad: number }[]> {
  const { rows } = await db.query<{ estado: string; cantidad: string }>(
    `SELECT estado, COUNT(*) AS cantidad
     FROM cotizaciones
     WHERE taller_id = $1
     GROUP BY estado`,
    [tallerId],
  );
  return rows.map((fila) => ({ estado: fila.estado, cantidad: Number(fila.cantidad) }));
}

/* ============================================================
   Acceso público (cliente final, sin autenticación)
   El cliente accede con un token único por cotización.
   ============================================================ */

export interface CotizacionPublicaFila {
  id: string;
  folio: string;
  estado: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  observaciones: string | null;
  fecha_aprobacion: string | null;
  fecha_creacion: string;
  fecha_estimada: string | null;
  cliente_nombre: string;
  cliente_telefono: string | null;
  placa: string;
  vehiculo_descripcion: string;
  vehiculo_kilometraje: number | null;
  taller_nombre: string;
  taller_telefono: string | null;
  taller_whatsapp: string | null;
  taller_correo: string | null;
  taller_logo: string | null;
  taller_moneda: string;
}

export async function buscarPorTokenPublico(
  db: QueryExec,
  token: string,
): Promise<CotizacionPublicaFila | null> {
  const { rows } = await db.query<CotizacionPublicaFila>(
    `SELECT
       c.id,
       c.folio,
       c.estado,
       c.subtotal,
       c.impuestos,
       c.descuento,
       c.total,
       c.observaciones,
       c.fecha_aprobacion,
       c.created_at AS fecha_creacion,
       o.fecha_estimada,
       CONCAT(cli.nombre, ' ', cli.apellidos) AS cliente_nombre,
       cli.telefono AS cliente_telefono,
       v.placa,
       CONCAT(v.marca, ' ', v.modelo, ' ', COALESCE(v.anio::text, '')) AS vehiculo_descripcion,
       v.kilometraje AS vehiculo_kilometraje,
       t.nombre AS taller_nombre,
       t.telefono AS taller_telefono,
       t.whatsapp AS taller_whatsapp,
       t.correo AS taller_correo,
       t.logo_url AS taller_logo,
       t.moneda AS taller_moneda
     FROM cotizaciones c
     JOIN clientes cli ON cli.id = c.cliente_id
     JOIN vehiculos v ON v.id = c.vehiculo_id
     JOIN talleres t ON t.id = c.taller_id
     LEFT JOIN ordenes_trabajo o ON o.id = c.orden_id
     WHERE c.token_publico = $1
     LIMIT 1`,
    [token],
  );
  return rows[0] ?? null;
}

/**
 * Registra la respuesta del cliente (APROBADA / RECHAZADA) por token público.
 * Solo tiene efecto si la cotización está ENVIADA (no se re-aprueba una ya resuelta).
 */
export async function responderPorToken(
  db: QueryExec,
  token: string,
  estado: string,
): Promise<CotizacionPublicaFila | null> {
  const { rows } = await db.query<{ id: string }>(
    `UPDATE cotizaciones
     SET estado = $2::varchar,
         fecha_aprobacion = CASE WHEN $2::varchar = 'APROBADA' THEN NOW() ELSE NULL END,
         updated_at = NOW()
     WHERE token_publico = $1 AND estado = 'ENVIADA'
     RETURNING id`,
    [token, estado],
  );
  if (!rows[0]) return null;
  return buscarPorTokenPublico(db, token);
}
