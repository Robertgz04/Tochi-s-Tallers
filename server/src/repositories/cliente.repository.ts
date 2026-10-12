import type { QueryExec } from '../config/db';

export interface ClienteFila {
  id: string;
  taller_id: string;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  whatsapp: string | null;
  correo: string | null;
  direccion: string | null;
  notas: string | null;
  fecha_registro: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  vehiculos?: string;
}

const COLUMNAS_BASE =
  'id, taller_id, nombre, apellidos, telefono, whatsapp, correo, direccion, notas, fecha_registro, activo';

/** Conteo de vehículos por cliente (subconsulta) para enriquecer el listado. */
const CONTEO_VEHICULOS = `
  (SELECT COUNT(*) FROM vehiculos v WHERE v.cliente_id = c.id) AS vehiculos`;

export interface DatosNuevoCliente {
  nombre: string;
  apellidos: string;
  telefono: string | null;
  whatsapp: string | null;
  correo: string | null;
  direccion: string | null;
  notas: string | null;
}

export async function listarClientes(
  db: QueryExec,
  tallerId: string,
  busqueda?: string,
): Promise<ClienteFila[]> {
  const parametros: unknown[] = [tallerId];
  let filtro = '';

  if (busqueda?.trim()) {
    parametros.push(`%${busqueda.trim()}%`);
    filtro = `AND (
      lower(nombre) LIKE lower($2)
      OR lower(apellidos) LIKE lower($2)
      OR lower(nombre || ' ' || apellidos) LIKE lower($2)
      OR telefono LIKE $2
      OR correo LIKE $2
    )`;
  }

  const { rows } = await db.query<ClienteFila>(
    `SELECT c.${COLUMNAS_BASE.split(', ').join(', c.')}, ${CONTEO_VEHICULOS}
     FROM clientes c
     WHERE c.taller_id = $1 ${filtro}
     ORDER BY c.activo DESC, c.created_at DESC`,
    parametros,
  );
  return rows;
}

export async function buscarCliente(
  db: QueryExec,
  tallerId: string,
  id: string,
): Promise<ClienteFila | null> {
  const { rows } = await db.query<ClienteFila>(
    `SELECT c.${COLUMNAS_BASE.split(', ').join(', c.')}, ${CONTEO_VEHICULOS}
     FROM clientes c
     WHERE c.id = $1 AND c.taller_id = $2
     LIMIT 1`,
    [id, tallerId],
  );
  return rows[0] ?? null;
}

export async function crearCliente(
  db: QueryExec,
  tallerId: string,
  datos: DatosNuevoCliente,
): Promise<ClienteFila> {
  const { rows } = await db.query<ClienteFila>(
    `INSERT INTO clientes (taller_id, nombre, apellidos, telefono, whatsapp, correo, direccion, notas)
     VALUES ($1, $2, $3, $4, $5, lower($6), $7, $8)
     RETURNING *`,
    [
      tallerId,
      datos.nombre,
      datos.apellidos,
      datos.telefono,
      datos.whatsapp,
      datos.correo,
      datos.direccion,
      datos.notas,
    ],
  );
  return rows[0];
}

export interface CamposCliente {
  nombre?: string;
  apellidos?: string;
  telefono?: string | null;
  whatsapp?: string | null;
  correo?: string | null;
  direccion?: string | null;
  notas?: string | null;
  activo?: boolean;
}

const COLUMNAS_ACTUALIZABLES: Record<keyof CamposCliente, string> = {
  nombre: 'nombre',
  apellidos: 'apellidos',
  telefono: 'telefono',
  whatsapp: 'whatsapp',
  correo: 'correo',
  direccion: 'direccion',
  notas: 'notas',
  activo: 'activo',
};

export async function actualizarCliente(
  db: QueryExec,
  tallerId: string,
  id: string,
  campos: CamposCliente,
): Promise<ClienteFila | null> {
  const definidos = (Object.keys(COLUMNAS_ACTUALIZABLES) as (keyof CamposCliente)[]).filter(
    (clave) => campos[clave] !== undefined,
  );
  if (definidos.length === 0) return null;

  const asignaciones = definidos.map((clave, indice) => `${COLUMNAS_ACTUALIZABLES[clave]} = $${indice + 3}`);
  const valores = definidos.map((clave) => campos[clave]);

  const { rows } = await db.query<ClienteFila>(
    `UPDATE clientes
     SET ${asignaciones.join(', ')}, updated_at = NOW()
     WHERE id = $1 AND taller_id = $2
     RETURNING *`,
    [id, tallerId, ...valores],
  );
  return rows[0] ?? null;
}

export async function eliminarCliente(
  db: QueryExec,
  tallerId: string,
  id: string,
): Promise<boolean> {
  const { rowCount } = await db.query('DELETE FROM clientes WHERE id = $1 AND taller_id = $2', [
    id,
    tallerId,
  ]);
  return (rowCount ?? 0) > 0;
}
