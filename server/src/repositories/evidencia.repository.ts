import type { QueryExec } from '../config/db';

export type EtapaEvidencia = 'ANTES' | 'DIAGNOSTICO' | 'DURANTE' | 'DESPUES';

export interface EvidenciaFila {
  id: string;
  taller_id: string;
  orden_id: string;
  etapa: EtapaEvidencia;
  url: string;
  nombre_archivo: string | null;
  mime: string | null;
  tamano_bytes: number;
  descripcion: string | null;
  creado_por: string | null;
  creado_por_nombre: string | null;
  created_at: string;
}

export interface DatosNuevaEvidencia {
  etapa: EtapaEvidencia;
  url: string;
  nombreArchivo: string | null;
  mime: string | null;
  tamanoBytes: number;
  descripcion: string | null;
  creadoPor: string | null;
}

const SELECT_BASE = `
  SELECT e.id, e.taller_id, e.orden_id, e.etapa, e.url, e.nombre_archivo, e.mime,
         e.tamano_bytes, e.descripcion, e.creado_por, e.created_at,
         TRIM(CONCAT_WS(' ', u.nombre, u.apellidos)) AS creado_por_nombre
  FROM orden_evidencias e
  LEFT JOIN usuarios u ON u.id = e.creado_por
`;

export async function listarPorOrden(
  db: QueryExec,
  tallerId: string,
  ordenId: string,
): Promise<EvidenciaFila[]> {
  const resultado = await db.query<EvidenciaFila>(
    `${SELECT_BASE} WHERE e.taller_id = $1 AND e.orden_id = $2 ORDER BY e.created_at DESC`,
    [tallerId, ordenId],
  );
  return resultado.rows;
}

export async function crear(
  db: QueryExec,
  tallerId: string,
  ordenId: string,
  datos: DatosNuevaEvidencia,
): Promise<EvidenciaFila> {
  const resultado = await db.query<EvidenciaFila>(
    `INSERT INTO orden_evidencias
       (taller_id, orden_id, etapa, url, nombre_archivo, mime, tamano_bytes, descripcion, creado_por)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, taller_id, orden_id, etapa, url, nombre_archivo, mime,
               tamano_bytes, descripcion, creado_por, created_at`,
    [
      tallerId,
      ordenId,
      datos.etapa,
      datos.url,
      datos.nombreArchivo,
      datos.mime,
      datos.tamanoBytes,
      datos.descripcion,
      datos.creadoPor,
    ],
  );
  const fila = resultado.rows[0];
  if (!fila) throw new Error('No se pudo registrar la evidencia.');
  const completa = await db.query<EvidenciaFila>(`${SELECT_BASE} WHERE e.id = $1`, [fila.id]);
  return completa.rows[0] ?? { ...fila, creado_por_nombre: null };
}

export async function buscarPorId(
  db: QueryExec,
  tallerId: string,
  ordenId: string,
  evidenciaId: string,
): Promise<EvidenciaFila | null> {
  const resultado = await db.query<EvidenciaFila>(
    `${SELECT_BASE} WHERE e.taller_id = $1 AND e.orden_id = $2 AND e.id = $3`,
    [tallerId, ordenId, evidenciaId],
  );
  return resultado.rows[0] ?? null;
}

export async function eliminar(
  db: QueryExec,
  tallerId: string,
  ordenId: string,
  evidenciaId: string,
): Promise<EvidenciaFila | null> {
  const resultado = await db.query<EvidenciaFila>(
    `DELETE FROM orden_evidencias
     WHERE taller_id = $1 AND orden_id = $2 AND id = $3
     RETURNING id, taller_id, orden_id, etapa, url, nombre_archivo, mime,
               tamano_bytes, descripcion, creado_por, created_at`,
    [tallerId, ordenId, evidenciaId],
  );
  const fila = resultado.rows[0];
  if (!fila) return null;
  return { ...fila, creado_por_nombre: null };
}

export async function contarPorOrden(
  db: QueryExec,
  tallerId: string,
  ordenId: string,
): Promise<number> {
  const resultado = await db.query<{ total: string }>(
    'SELECT COUNT(*)::text AS total FROM orden_evidencias WHERE taller_id = $1 AND orden_id = $2',
    [tallerId, ordenId],
  );
  return Number(resultado.rows[0]?.total ?? 0);
}
