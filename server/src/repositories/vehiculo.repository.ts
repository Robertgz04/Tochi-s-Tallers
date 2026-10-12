import type { QueryExec } from '../config/db';

export interface VehiculoFila {
  id: string;
  taller_id: string;
  cliente_id: string;
  placa: string;
  vin: string | null;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  motor: string | null;
  kilometraje: number;
  combustible: string;
  transmision: string | null;
  notas: string | null;
  foto_url: string | null;
  fecha_registro: string;
  created_at: string;
  updated_at: string;
  cliente_nombre?: string;
  ordenes_count?: string;
}

const COLUMNAS =
  'v.id, v.taller_id, v.cliente_id, v.placa, v.vin, v.marca, v.modelo, v.anio, v.color, v.motor, v.kilometraje, v.combustible, v.transmision, v.notas, v.foto_url, v.fecha_registro';

const COLUMNAS_COMPLETAS = `${COLUMNAS}, v.created_at, v.updated_at`;

export interface DatosNuevoVehiculo {
  clienteId: string;
  placa: string;
  vin: string | null;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  motor: string | null;
  kilometraje: number;
  combustible: string;
  transmision: string | null;
  notas: string | null;
}

export async function listarVehiculos(
  db: QueryExec,
  tallerId: string,
  opciones: { busqueda?: string; clienteId?: string } = {},
): Promise<VehiculoFila[]> {
  const parametros: unknown[] = [tallerId];
  let filtro = '';

  if (opciones.clienteId) {
    parametros.push(opciones.clienteId);
    filtro += ` AND v.cliente_id = $${parametros.length}`;
  }
  if (opciones.busqueda?.trim()) {
    parametros.push(`%${opciones.busqueda.trim()}%`);
    filtro += ` AND (
      lower(v.placa) LIKE lower($${parametros.length})
      OR lower(v.marca || ' ' || v.modelo) LIKE lower($${parametros.length})
      OR lower(v.vin) LIKE lower($${parametros.length})
      OR lower(c.nombre || ' ' || c.apellidos) LIKE lower($${parametros.length})
    )`;
  }

  const { rows } = await db.query<VehiculoFila>(
    `SELECT ${COLUMNAS},
            CONCAT(c.nombre, ' ', c.apellidos) AS cliente_nombre,
            (SELECT COUNT(*) FROM ordenes_trabajo o WHERE o.vehiculo_id = v.id) AS ordenes_count
     FROM vehiculos v
     JOIN clientes c ON c.id = v.cliente_id
     WHERE v.taller_id = $1 ${filtro}
     ORDER BY v.created_at DESC`,
    parametros,
  );
  return rows;
}

export async function buscarVehiculo(
  db: QueryExec,
  tallerId: string,
  id: string,
): Promise<VehiculoFila | null> {
  const { rows } = await db.query<VehiculoFila>(
    `SELECT ${COLUMNAS_COMPLETAS},
            CONCAT(c.nombre, ' ', c.apellidos) AS cliente_nombre
     FROM vehiculos v
     JOIN clientes c ON c.id = v.cliente_id
     WHERE v.id = $1 AND v.taller_id = $2
     LIMIT 1`,
    [id, tallerId],
  );
  return rows[0] ?? null;
}

export async function crearVehiculo(
  db: QueryExec,
  tallerId: string,
  datos: DatosNuevoVehiculo,
): Promise<VehiculoFila> {
  const { rows } = await db.query<VehiculoFila>(
    `INSERT INTO vehiculos (
       taller_id, cliente_id, placa, vin, marca, modelo, anio, color, motor,
       kilometraje, combustible, transmision, notas
     ) VALUES ($1, $2, upper($3), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      tallerId,
      datos.clienteId,
      datos.placa,
      datos.vin,
      datos.marca,
      datos.modelo,
      datos.anio,
      datos.color,
      datos.motor,
      datos.kilometraje,
      datos.combustible,
      datos.transmision,
      datos.notas,
    ],
  );
  return rows[0];
}

export interface CamposVehiculo {
  placa?: string;
  vin?: string | null;
  marca?: string;
  modelo?: string;
  anio?: number | null;
  color?: string | null;
  motor?: string | null;
  kilometraje?: number;
  combustible?: string;
  transmision?: string | null;
  notas?: string | null;
  foto_url?: string | null;
}

const COLUMNAS_ACTUALIZABLES: Record<keyof CamposVehiculo, string> = {
  placa: 'placa',
  vin: 'vin',
  marca: 'marca',
  modelo: 'modelo',
  anio: 'anio',
  color: 'color',
  motor: 'motor',
  kilometraje: 'kilometraje',
  combustible: 'combustible',
  transmision: 'transmision',
  notas: 'notas',
  foto_url: 'foto_url',
};

export async function actualizarVehiculo(
  db: QueryExec,
  tallerId: string,
  id: string,
  campos: CamposVehiculo,
): Promise<VehiculoFila | null> {
  const definidos = (Object.keys(COLUMNAS_ACTUALIZABLES) as (keyof CamposVehiculo)[]).filter(
    (clave) => campos[clave] !== undefined,
  );
  if (definidos.length === 0) return null;

  const asignaciones = definidos.map(
    (clave, indice) => `${COLUMNAS_ACTUALIZABLES[clave]} = $${indice + 3}`,
  );
  const valores = definidos.map((clave) => campos[clave]);

  const { rows } = await db.query<VehiculoFila>(
    `UPDATE vehiculos
     SET ${asignaciones.join(', ')}, updated_at = NOW()
     WHERE id = $1 AND taller_id = $2
     RETURNING *`,
    [id, tallerId, ...valores],
  );
  return rows[0] ?? null;
}

export async function eliminarVehiculo(
  db: QueryExec,
  tallerId: string,
  id: string,
): Promise<boolean> {
  const { rowCount } = await db.query('DELETE FROM vehiculos WHERE id = $1 AND taller_id = $2', [
    id,
    tallerId,
  ]);
  return (rowCount ?? 0) > 0;
}
