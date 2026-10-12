import type { QueryExec } from '../config/db';

export interface CitaFila {
  id: string;
  taller_id: string;
  cliente_id: string | null;
  vehiculo_id: string | null;
  orden_id: string | null;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  todo_el_dia: boolean;
  estado: string;
  responsable_id: string | null;
  created_at: string;
  updated_at: string;
  cliente_nombre?: string;
  responsable_nombre?: string | null;
  placa?: string | null;
}

const COLUMNAS = `
  c.id, c.taller_id, c.cliente_id, c.vehiculo_id, c.orden_id, c.titulo, c.descripcion,
  c.fecha_inicio, c.fecha_fin, c.todo_el_dia, c.estado, c.responsable_id, c.created_at, c.updated_at,
  CONCAT(cli.nombre, ' ', cli.apellidos) AS cliente_nombre,
  CONCAT_WS(' ', u.nombre, u.apellidos) AS responsable_nombre,
  v.placa`;

const JOIN = `
  FROM citas c
  LEFT JOIN clientes cli ON cli.id = c.cliente_id
  LEFT JOIN usuarios u ON u.id = c.responsable_id
  LEFT JOIN vehiculos v ON v.id = c.vehiculo_id`;

export interface OpcionesCitas {
  desde?: string;
  hasta?: string;
  estado?: string;
  busqueda?: string;
  pagina: number;
  porPagina: number;
}

export async function listarCitas(
  db: QueryExec,
  tallerId: string,
  opciones: OpcionesCitas,
): Promise<{ filas: CitaFila[]; total: number }> {
  const parametros: unknown[] = [tallerId];
  let filtro = '';
  if (opciones.desde) { parametros.push(opciones.desde); filtro += ` AND c.fecha_fin >= $${parametros.length}::timestamptz`; }
  if (opciones.hasta) { parametros.push(opciones.hasta); filtro += ` AND c.fecha_inicio <= $${parametros.length}::timestamptz`; }
  if (opciones.estado) { parametros.push(opciones.estado); filtro += ` AND c.estado = $${parametros.length}`; }
  if (opciones.busqueda?.trim()) {
    parametros.push(`%${opciones.busqueda.trim()}%`);
    filtro += ` AND (lower(c.titulo) LIKE lower($${parametros.length}) OR lower(COALESCE(cli.nombre, '')) LIKE lower($${parametros.length}) OR lower(COALESCE(v.placa, '')) LIKE lower($${parametros.length}))`;
  }
  const { rows: conteo } = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total ${JOIN} WHERE c.taller_id = $1 ${filtro}`,
    parametros,
  );
  parametros.push(opciones.porPagina);
  const limite = `$${parametros.length}`;
  parametros.push((opciones.pagina - 1) * opciones.porPagina);
  const offset = `$${parametros.length}`;
  const { rows } = await db.query<CitaFila>(
    `SELECT ${COLUMNAS} ${JOIN} WHERE c.taller_id = $1 ${filtro} ORDER BY c.fecha_inicio ASC LIMIT ${limite} OFFSET ${offset}`,
    parametros,
  );
  return { filas: rows, total: Number(conteo[0]?.total ?? 0) };
}

export async function buscarCita(db: QueryExec, tallerId: string, id: string): Promise<CitaFila | null> {
  const { rows } = await db.query<CitaFila>(`SELECT ${COLUMNAS} ${JOIN} WHERE c.id = $1 AND c.taller_id = $2 LIMIT 1`, [id, tallerId]);
  return rows[0] ?? null;
}

export interface DatosNuevaCita {
  clienteId: string | null;
  vehiculoId: string | null;
  ordenId: string | null;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  todoElDia: boolean;
  estado: string;
  responsableId: string | null;
}

export async function crearCita(db: QueryExec, tallerId: string, datos: DatosNuevaCita): Promise<CitaFila | null> {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO citas (taller_id, cliente_id, vehiculo_id, orden_id, titulo, descripcion, fecha_inicio, fecha_fin, todo_el_dia, estado, responsable_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::timestamptz, $9, $10, $11)
     RETURNING id`,
    [tallerId, datos.clienteId, datos.vehiculoId, datos.ordenId, datos.titulo, datos.descripcion, datos.fechaInicio, datos.fechaFin, datos.todoElDia, datos.estado, datos.responsableId],
  );
  if (!rows[0]) return null;
  return buscarCita(db, tallerId, rows[0].id);
}

export interface CamposCita {
  cliente_id?: string | null;
  vehiculo_id?: string | null;
  orden_id?: string | null;
  titulo?: string;
  descripcion?: string | null;
  fecha_inicio?: string;
  fecha_fin?: string;
  todo_el_dia?: boolean;
  estado?: string;
  responsable_id?: string | null;
}

const COLUMNAS_CITA: Record<keyof CamposCita, string> = {
  cliente_id: 'cliente_id', vehiculo_id: 'vehiculo_id', orden_id: 'orden_id', titulo: 'titulo',
  descripcion: 'descripcion', fecha_inicio: 'fecha_inicio', fecha_fin: 'fecha_fin', todo_el_dia: 'todo_el_dia',
  estado: 'estado', responsable_id: 'responsable_id',
};

export async function actualizarCita(
  db: QueryExec,
  tallerId: string,
  id: string,
  campos: CamposCita,
): Promise<CitaFila | null> {
  const definidos = (Object.keys(COLUMNAS_CITA) as (keyof CamposCita)[]).filter((clave) => campos[clave] !== undefined);
  if (definidos.length === 0) return null;
  const esFecha = (clave: keyof CamposCita) => clave === 'fecha_inicio' || clave === 'fecha_fin';
  const asignaciones = definidos.map((clave, indice) => `${COLUMNAS_CITA[clave]} = $${indice + 3}${esFecha(clave) ? '::timestamptz' : ''}`);
  const valores = definidos.map((clave) => campos[clave]);
  const { rows } = await db.query<{ id: string }>(
    `UPDATE citas SET ${asignaciones.join(', ')}, updated_at = NOW() WHERE id = $1 AND taller_id = $2 RETURNING id`,
    [id, tallerId, ...valores],
  );
  if (!rows[0]) return null;
  return buscarCita(db, tallerId, rows[0].id);
}

export async function eliminarCita(db: QueryExec, tallerId: string, id: string): Promise<boolean> {
  const { rowCount } = await db.query('DELETE FROM citas WHERE id = $1 AND taller_id = $2', [id, tallerId]);
  return (rowCount ?? 0) > 0;
}
