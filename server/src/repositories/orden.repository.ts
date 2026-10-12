import { withTransaction, type QueryExec } from '../config/db';

export interface OrdenFila {
  id: string;
  folio: string;
  taller_id: string;
  cliente_id: string;
  vehiculo_id: string;
  mecanico_id: string | null;
  fecha_ingreso: string;
  fecha_estimada: string | null;
  fecha_finalizacion: string | null;
  kilometraje_entrada: number;
  nivel_combustible: string;
  descripcion_cliente: string;
  diagnostico: string | null;
  observaciones: string | null;
  estado: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  created_at: string;
  updated_at: string;
  // Campos de joins.
  cliente_nombre?: string;
  placa?: string;
  vehiculo_descripcion?: string;
  mecanico_nombre?: string | null;
  pagado?: number;
}

const COLUMNAS_LISTADO = `
  o.id, o.folio, o.cliente_id, o.vehiculo_id, o.mecanico_id, o.fecha_ingreso, o.fecha_estimada,
  o.fecha_finalizacion, o.estado, o.total, o.kilometraje_entrada, o.descripcion_cliente,
  CONCAT(c.nombre, ' ', c.apellidos) AS cliente_nombre,
  v.placa,
  CONCAT(v.marca, ' ', v.modelo, ' ', COALESCE(v.anio::text, '')) AS vehiculo_descripcion,
  CONCAT(m.nombre, ' ', m.apellidos) AS mecanico_nombre`;

export interface OpcionesListadoOrdenes {
  estado?: string;
  busqueda?: string;
  pagina: number;
  porPagina: number;
}

export interface ListadoOrdenes {
  filas: OrdenFila[];
  total: number;
}

export async function listarOrdenes(
  db: QueryExec,
  tallerId: string,
  opciones: OpcionesListadoOrdenes,
): Promise<ListadoOrdenes> {
  const parametros: unknown[] = [tallerId];
  let filtro = '';

  if (opciones.estado) {
    parametros.push(opciones.estado);
    filtro += ` AND o.estado = $${parametros.length}`;
  }
  if (opciones.busqueda?.trim()) {
    parametros.push(`%${opciones.busqueda.trim()}%`);
    filtro += ` AND (
      lower(o.folio) LIKE lower($${parametros.length})
      OR lower(c.nombre || ' ' || c.apellidos) LIKE lower($${parametros.length})
      OR lower(v.placa) LIKE lower($${parametros.length})
      OR lower(v.marca || ' ' || v.modelo) LIKE lower($${parametros.length})
    )`;
  }

  const { rows: conteo } = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM ordenes_trabajo o
     JOIN clientes c ON c.id = o.cliente_id
     JOIN vehiculos v ON v.id = o.vehiculo_id
     WHERE o.taller_id = $1 ${filtro}`,
    parametros,
  );

  parametros.push(opciones.porPagina);
  const limite = `$${parametros.length}`;
  parametros.push((opciones.pagina - 1) * opciones.porPagina);
  const offset = `$${parametros.length}`;

  const { rows } = await db.query<OrdenFila>(
    `SELECT ${COLUMNAS_LISTADO}
     FROM ordenes_trabajo o
     JOIN clientes c ON c.id = o.cliente_id
     JOIN vehiculos v ON v.id = o.vehiculo_id
     LEFT JOIN usuarios m ON m.id = o.mecanico_id
     WHERE o.taller_id = $1 ${filtro}
     ORDER BY o.fecha_ingreso DESC, o.created_at DESC
     LIMIT ${limite} OFFSET ${offset}`,
    parametros,
  );

  return { filas: rows, total: Number(conteo[0]?.total ?? 0) };
}

export async function buscarOrden(
  db: QueryExec,
  tallerId: string,
  id: string,
): Promise<OrdenFila | null> {
  const { rows } = await db.query<OrdenFila>(
    `SELECT o.*,
            CONCAT(c.nombre, ' ', c.apellidos) AS cliente_nombre,
            v.placa,
            CONCAT(v.marca, ' ', v.modelo, ' ', COALESCE(v.anio::text, '')) AS vehiculo_descripcion,
            CONCAT(m.nombre, ' ', m.apellidos) AS mecanico_nombre,
            COALESCE(p.pagado, 0) AS pagado
     FROM ordenes_trabajo o
     JOIN clientes c ON c.id = o.cliente_id
     JOIN vehiculos v ON v.id = o.vehiculo_id
     LEFT JOIN usuarios m ON m.id = o.mecanico_id
     LEFT JOIN (
       SELECT orden_id, SUM(monto) AS pagado
       FROM pagos
       GROUP BY orden_id
     ) p ON p.orden_id = o.id
     WHERE o.id = $1 AND o.taller_id = $2
     LIMIT 1`,
    [id, tallerId],
  );
  return rows[0] ?? null;
}

/** Genera el siguiente número de folio secuencial (ej. "000014") dentro del taller. */
export async function siguienteNumeroFolio(db: QueryExec, tallerId: string): Promise<string> {
  const { rows } = await db.query<{ siguiente: string }>(
    `SELECT to_char(
       COALESCE(MAX(NULLIF(regexp_replace(folio, '[^0-9]', '', 'g'), '')::bigint), 0) + 1,
       'FM000000'
     ) AS siguiente
     FROM ordenes_trabajo
     WHERE taller_id = $1`,
    [tallerId],
  );
  return rows[0]?.siguiente ?? '000001';
}

export interface DatosNuevaOrden {
  clienteId: string;
  vehiculoId: string;
  mecanicoId: string | null;
  fechaEstimada: string | null;
  kilometrajeEntrada: number;
  nivelCombustible: string;
  descripcionCliente: string;
  diagnostico: string | null;
}

/**
 * Crea la orden dentro de una transacción con lock por taller,
 * generando el folio de forma atómica (evita folios duplicados por concurrencia).
 */
export async function crearOrdenConFolio(
  tallerId: string,
  prefijo: string,
  datos: DatosNuevaOrden,
): Promise<OrdenFila | null> {
  return withTransaction(async (cliente) => {
    await cliente.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`orden:${tallerId}`]);
    const numero = await siguienteNumeroFolio(cliente, tallerId);
    const folio = `${prefijo}-${numero}`;

    const { rows } = await cliente.query<{ id: string }>(
      `INSERT INTO ordenes_trabajo (
         folio, taller_id, cliente_id, vehiculo_id, mecanico_id, fecha_estimada,
         kilometraje_entrada, nivel_combustible, descripcion_cliente, diagnostico
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        folio,
        tallerId,
        datos.clienteId,
        datos.vehiculoId,
        datos.mecanicoId,
        datos.fechaEstimada,
        datos.kilometrajeEntrada,
        datos.nivelCombustible,
        datos.descripcionCliente,
        datos.diagnostico,
      ],
    );
    if (!rows[0]) return null;
    return buscarOrden(cliente, tallerId, rows[0].id);
  });
}


export interface CamposOrden {
  mecanico_id?: string | null;
  fecha_estimada?: string | null;
  fecha_finalizacion?: string | null;
  nivel_combustible?: string;
  descripcion_cliente?: string;
  diagnostico?: string | null;
  observaciones?: string | null;
  subtotal?: number;
  impuestos?: number;
  descuento?: number;
  total?: number;
}

const COLUMNAS_ACTUALIZABLES: Record<keyof CamposOrden, string> = {
  mecanico_id: 'mecanico_id',
  fecha_estimada: 'fecha_estimada',
  fecha_finalizacion: 'fecha_finalizacion',
  nivel_combustible: 'nivel_combustible',
  descripcion_cliente: 'descripcion_cliente',
  diagnostico: 'diagnostico',
  observaciones: 'observaciones',
  subtotal: 'subtotal',
  impuestos: 'impuestos',
  descuento: 'descuento',
  total: 'total',
};

export async function actualizarOrden(
  db: QueryExec,
  tallerId: string,
  id: string,
  campos: CamposOrden,
): Promise<OrdenFila | null> {
  const definidos = (Object.keys(COLUMNAS_ACTUALIZABLES) as (keyof CamposOrden)[]).filter(
    (clave) => campos[clave] !== undefined,
  );
  if (definidos.length === 0) return null;

  const asignaciones = definidos.map(
    (clave, indice) => `${COLUMNAS_ACTUALIZABLES[clave]} = $${indice + 3}`,
  );
  const valores = definidos.map((clave) => campos[clave]);

  const { rows } = await db.query<{ id: string }>(
    `UPDATE ordenes_trabajo
     SET ${asignaciones.join(', ')}, updated_at = NOW()
     WHERE id = $1 AND taller_id = $2
     RETURNING id`,
    [id, tallerId, ...valores],
  );
  if (!rows[0]) return null;
  return buscarOrden(db, tallerId, rows[0].id);
}


export async function cambiarEstadoOrden(
  db: QueryExec,
  tallerId: string,
  id: string,
  estado: string,
): Promise<OrdenFila | null> {
  const { rows } = await db.query<{ id: string }>(
    `UPDATE ordenes_trabajo
     SET estado = $3::varchar,
         fecha_finalizacion = CASE WHEN $3::varchar = 'ENTREGADO' THEN NOW() ELSE NULL END,
         updated_at = NOW()
     WHERE id = $1 AND taller_id = $2
     RETURNING id`,
    [id, tallerId, estado],
  );
  if (!rows[0]) return null;
  return buscarOrden(db, tallerId, rows[0].id);
}

/** Conteo de órdenes por estado (para los filtros de la página). */
export async function contarPorEstado(
  db: QueryExec,
  tallerId: string,
): Promise<{ estado: string; cantidad: number }[]> {
  const { rows } = await db.query<{ estado: string; cantidad: string }>(
    `SELECT estado, COUNT(*) AS cantidad
     FROM ordenes_trabajo
     WHERE taller_id = $1
     GROUP BY estado`,
    [tallerId],
  );
  return rows.map((fila) => ({ estado: fila.estado, cantidad: Number(fila.cantidad) }));
}


