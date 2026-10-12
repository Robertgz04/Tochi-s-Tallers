import type { QueryExec } from '../config/db';

export interface TallerFila {
  id: string;
  nombre: string;
  razon_social: string | null;
  logo_url: string | null;
  telefono: string | null;
  whatsapp: string | null;
  correo: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  codigo_postal: string | null;
  rfc: string | null;
  moneda: string;
  zona_horaria: string;
  iva: number;
  prefijo_folio: string;
  activo: boolean;
  plan: string;
  fecha_inicio: string | null;
  fecha_vencimiento: string | null;
  estado_suscripcion: string;
  created_at: string;
  updated_at: string;
}

export interface DatosNuevoTaller {
  nombre: string;
  razonSocial?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  correo?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  rfc?: string | null;
}

export async function crearTaller(db: QueryExec, datos: DatosNuevoTaller): Promise<TallerFila> {
  const { rows } = await db.query<TallerFila>(
    `INSERT INTO talleres (nombre, razon_social, telefono, whatsapp, correo, direccion, ciudad, estado, codigo_postal, rfc)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      datos.nombre,
      datos.razonSocial ?? null,
      datos.telefono ?? null,
      datos.whatsapp ?? null,
      datos.correo ?? null,
      datos.direccion ?? null,
      datos.ciudad ?? null,
      datos.estado ?? null,
      datos.codigoPostal ?? null,
      datos.rfc ?? null,
    ],
  );
  return rows[0];
}

export async function buscarTallerPorId(db: QueryExec, id: string): Promise<TallerFila | null> {
  const { rows } = await db.query<TallerFila>('SELECT * FROM talleres WHERE id = $1 LIMIT 1', [id]);
  return rows[0] ?? null;
}

export interface CamposTaller {
  nombre?: string;
  razon_social?: string;
  logo_url?: string;
  telefono?: string;
  whatsapp?: string;
  correo?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  rfc?: string;
  moneda?: string;
  zona_horaria?: string;
  iva?: number;
  prefijo_folio?: string;
}

const COLUMNAS_ACTUALIZABLES = new Set<keyof CamposTaller>([
  'nombre',
  'razon_social',
  'logo_url',
  'telefono',
  'whatsapp',
  'correo',
  'direccion',
  'ciudad',
  'estado',
  'codigo_postal',
  'rfc',
  'moneda',
  'zona_horaria',
  'iva',
  'prefijo_folio',
]);

export async function actualizarTaller(
  db: QueryExec,
  id: string,
  campos: CamposTaller,
): Promise<TallerFila | null> {
  const claves = (Object.keys(campos) as (keyof CamposTaller)[]).filter(
    (clave) => COLUMNAS_ACTUALIZABLES.has(clave) && campos[clave] !== undefined,
  );

  if (claves.length === 0) return null;

  const asignaciones = claves.map((clave, indice) => `${clave} = $${indice + 2}`);
  const valores = claves.map((clave) => campos[clave]);

  const { rows } = await db.query<TallerFila>(
    `UPDATE talleres
     SET ${asignaciones.join(', ')}, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, ...valores],
  );
  return rows[0] ?? null;
}
