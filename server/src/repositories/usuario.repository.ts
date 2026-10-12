import type { QueryExec } from '../config/db';
import type { Rol } from '../types/roles';

export interface UsuarioFila {
  id: string;
  taller_id: string | null;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  password_hash: string;
  rol: Rol;
  foto_url: string | null;
  activo: boolean;
  ultimo_acceso: string | null;
}

export interface TokenRecuperacionFila {
  id: string;
  usuario_id: string;
  expira_en: string;
  usado: boolean;
}

const COLUMNAS =
  'id, taller_id, nombre, apellidos, correo, telefono, rol, foto_url, activo, ultimo_acceso';

export async function buscarUsuarioPorCorreo(
  db: QueryExec,
  correo: string,
): Promise<UsuarioFila | null> {
  const { rows } = await db.query<UsuarioFila>(
    'SELECT * FROM usuarios WHERE lower(correo) = lower($1) LIMIT 1',
    [correo],
  );
  return rows[0] ?? null;
}

export async function buscarUsuarioPorId(db: QueryExec, id: string): Promise<UsuarioFila | null> {
  const { rows } = await db.query<UsuarioFila>('SELECT * FROM usuarios WHERE id = $1 LIMIT 1', [
    id,
  ]);
  return rows[0] ?? null;
}

export async function correoExiste(db: QueryExec, correo: string): Promise<boolean> {
  const { rows } = await db.query<{ existe: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM usuarios WHERE lower(correo) = lower($1)) AS existe',
    [correo],
  );
  return rows[0]?.existe === true;
}

export interface DatosNuevoUsuario {
  tallerId: string | null;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  passwordHash: string;
  rol: Rol;
}

export async function crearUsuario(db: QueryExec, datos: DatosNuevoUsuario): Promise<UsuarioFila> {
  const { rows } = await db.query<UsuarioFila>(
    `INSERT INTO usuarios (taller_id, nombre, apellidos, correo, telefono, password_hash, rol)
     VALUES ($1, $2, $3, lower($4), $5, $6, $7)
     RETURNING *`,
    [
      datos.tallerId,
      datos.nombre,
      datos.apellidos,
      datos.correo,
      datos.telefono,
      datos.passwordHash,
      datos.rol,
    ],
  );
  return rows[0];
}

export async function actualizarUltimoAcceso(db: QueryExec, id: string): Promise<void> {
  await db.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1', [id]);
}

export async function actualizarPasswordHash(
  db: QueryExec,
  id: string,
  passwordHash: string,
): Promise<void> {
  await db.query('UPDATE usuarios SET password_hash = $2, updated_at = NOW() WHERE id = $1', [
    id,
    passwordHash,
  ]);
}

export async function listarUsuariosPorTaller(
  db: QueryExec,
  tallerId: string,
): Promise<UsuarioFila[]> {
  const { rows } = await db.query<UsuarioFila>(
    `SELECT ${COLUMNAS} FROM usuarios
     WHERE taller_id = $1
     ORDER BY activo DESC, created_at ASC`,
    [tallerId],
  );
  return rows;
}

export async function buscarUsuarioDeTaller(
  db: QueryExec,
  tallerId: string,
  id: string,
): Promise<UsuarioFila | null> {
  const { rows } = await db.query<UsuarioFila>(
    'SELECT * FROM usuarios WHERE id = $1 AND taller_id = $2 LIMIT 1',
    [id, tallerId],
  );
  return rows[0] ?? null;
}

export interface CamposUsuario {
  nombre?: string;
  apellidos?: string;
  telefono?: string | null;
  rol?: Rol;
  activo?: boolean;
}

const COLUMNAS_ACTUALIZABLES: Record<keyof CamposUsuario, string> = {
  nombre: 'nombre',
  apellidos: 'apellidos',
  telefono: 'telefono',
  rol: 'rol',
  activo: 'activo',
};

export async function actualizarUsuario(
  db: QueryExec,
  tallerId: string,
  id: string,
  campos: CamposUsuario,
): Promise<UsuarioFila | null> {
  const camposDefinidos = (
    Object.keys(COLUMNAS_ACTUALIZABLES) as (keyof CamposUsuario)[]
  ).filter((clave) => campos[clave] !== undefined);

  if (camposDefinidos.length === 0) return null;

  const asignaciones = camposDefinidos.map(
    (clave, indice) => `${COLUMNAS_ACTUALIZABLES[clave]} = $${indice + 3}`,
  );
  const valores = camposDefinidos.map((clave) => campos[clave]);
  const { rows } = await db.query<UsuarioFila>(
    `UPDATE usuarios
     SET ${asignaciones.join(', ')}, updated_at = NOW()
     WHERE id = $1 AND taller_id = $2
     RETURNING *`,
    [id, tallerId, ...valores],
  );
  return rows[0] ?? null;
}

// ---- Tokens de recuperación de contraseña ----

export async function crearTokenRecuperacion(
  db: QueryExec,
  datos: { usuarioId: string; token: string; expiraEn: Date },
): Promise<void> {
  await db.query(
    `INSERT INTO tokens_recuperacion (usuario_id, token, expira_en)
     VALUES ($1, $2, $3)`,
    [datos.usuarioId, datos.token, datos.expiraEn],
  );
}

export async function buscarTokenRecuperacion(
  db: QueryExec,
  token: string,
): Promise<TokenRecuperacionFila | null> {
  const { rows } = await db.query<TokenRecuperacionFila>(
    'SELECT id, usuario_id, expira_en, usado FROM tokens_recuperacion WHERE token = $1 LIMIT 1',
    [token],
  );
  return rows[0] ?? null;
}

export async function marcarTokenUsado(db: QueryExec, token: string): Promise<void> {
  await db.query('UPDATE tokens_recuperacion SET usado = TRUE WHERE token = $1', [token]);
}
