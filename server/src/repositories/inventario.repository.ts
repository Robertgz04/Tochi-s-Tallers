import type { QueryExec } from '../config/db';

export interface InventarioFila {
  id: string;
  taller_id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  unidad: string;
  costo: number;
  precio: number;
  stock: number;
  stock_minimo: number;
  ubicacion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpcionesInventario {
  busqueda?: string;
  soloStockBajo?: boolean;
  categoria?: string;
  pagina: number;
  porPagina: number;
}

export async function listarInventario(
  db: QueryExec,
  tallerId: string,
  opciones: OpcionesInventario,
): Promise<{ filas: InventarioFila[]; total: number }> {
  const parametros: unknown[] = [tallerId];
  let filtro = '';
  if (opciones.busqueda?.trim()) {
    parametros.push(`%${opciones.busqueda.trim()}%`);
    filtro += ` AND (lower(nombre) LIKE lower($${parametros.length}) OR lower(sku) LIKE lower($${parametros.length}) OR lower(COALESCE(categoria, '')) LIKE lower($${parametros.length}))`;
  }
  if (opciones.categoria) {
    parametros.push(opciones.categoria);
    filtro += ` AND categoria = $${parametros.length}`;
  }
  if (opciones.soloStockBajo) {
    filtro += ` AND stock <= stock_minimo`;
  }
  const { rows: conteo } = await db.query<{ total: string }>(
    `SELECT COUNT(*) AS total FROM inventario WHERE taller_id = $1 ${filtro}`,
    parametros,
  );
  parametros.push(opciones.porPagina);
  const limite = `$${parametros.length}`;
  parametros.push((opciones.pagina - 1) * opciones.porPagina);
  const offset = `$${parametros.length}`;
  const { rows } = await db.query<InventarioFila>(
    `SELECT * FROM inventario WHERE taller_id = $1 ${filtro} ORDER BY nombre ASC LIMIT ${limite} OFFSET ${offset}`,
    parametros,
  );
  return { filas: rows, total: Number(conteo[0]?.total ?? 0) };
}

export async function buscarInventario(db: QueryExec, tallerId: string, id: string): Promise<InventarioFila | null> {
  const { rows } = await db.query<InventarioFila>('SELECT * FROM inventario WHERE id = $1 AND taller_id = $2 LIMIT 1', [id, tallerId]);
  return rows[0] ?? null;
}

export interface DatosNuevoItem {
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  unidad: string;
  costo: number;
  precio: number;
  stock: number;
  stockMinimo: number;
  ubicacion: string | null;
}

export async function crearInventario(db: QueryExec, tallerId: string, datos: DatosNuevoItem): Promise<InventarioFila> {
  const { rows } = await db.query<InventarioFila>(
    `INSERT INTO inventario (taller_id, sku, nombre, descripcion, categoria, unidad, costo, precio, stock, stock_minimo, ubicacion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [tallerId, datos.sku, datos.nombre, datos.descripcion, datos.categoria, datos.unidad, datos.costo, datos.precio, datos.stock, datos.stockMinimo, datos.ubicacion],
  );
  return rows[0];
}

export interface CamposInventario {
  sku?: string;
  nombre?: string;
  descripcion?: string | null;
  categoria?: string | null;
  unidad?: string;
  costo?: number;
  precio?: number;
  stock?: number;
  stock_minimo?: number;
  ubicacion?: string | null;
  activo?: boolean;
}

const COLUMNAS_INV: Record<keyof CamposInventario, string> = {
  sku: 'sku', nombre: 'nombre', descripcion: 'descripcion', categoria: 'categoria', unidad: 'unidad',
  costo: 'costo', precio: 'precio', stock: 'stock', stock_minimo: 'stock_minimo', ubicacion: 'ubicacion', activo: 'activo',
};

export async function actualizarInventario(
  db: QueryExec,
  tallerId: string,
  id: string,
  campos: CamposInventario,
): Promise<InventarioFila | null> {
  const definidos = (Object.keys(COLUMNAS_INV) as (keyof CamposInventario)[]).filter((clave) => campos[clave] !== undefined);
  if (definidos.length === 0) return null;
  const asignaciones = definidos.map((clave, indice) => `${COLUMNAS_INV[clave]} = $${indice + 3}`);
  const valores = definidos.map((clave) => campos[clave]);
  const { rows } = await db.query<InventarioFila>(
    `UPDATE inventario SET ${asignaciones.join(', ')}, updated_at = NOW() WHERE id = $1 AND taller_id = $2 RETURNING *`,
    [id, tallerId, ...valores],
  );
  return rows[0] ?? null;
}

export async function eliminarInventario(db: QueryExec, tallerId: string, id: string): Promise<boolean> {
  const { rowCount } = await db.query('DELETE FROM inventario WHERE id = $1 AND taller_id = $2', [id, tallerId]);
  return (rowCount ?? 0) > 0;
}

export async function contarStockBajo(db: QueryExec, tallerId: string): Promise<number> {
  const { rows } = await db.query<{ cantidad: string }>(
    'SELECT COUNT(*) AS cantidad FROM inventario WHERE taller_id = $1 AND activo AND stock <= stock_minimo',
    [tallerId],
  );
  return Number(rows[0]?.cantidad ?? 0);
}

export async function categorias(db: QueryExec, tallerId: string): Promise<string[]> {
  const { rows } = await db.query<{ categoria: string }>(
    'SELECT DISTINCT categoria FROM inventario WHERE taller_id = $1 AND categoria IS NOT NULL ORDER BY categoria',
    [tallerId],
  );
  return rows.map((fila) => fila.categoria);
}

export async function registrarMovimiento(
  db: QueryExec,
  tallerId: string,
  datos: { itemId: string; tipo: string; cantidad: number; motivo: string | null; usuarioId: string | null },
): Promise<void> {
  const signo = datos.tipo === 'SALIDA' ? -Math.abs(datos.cantidad) : Math.abs(datos.cantidad);
  await db.query('UPDATE inventario SET stock = stock + $3, updated_at = NOW() WHERE id = $1 AND taller_id = $2', [datos.itemId, tallerId, signo]);
  await db.query(
    `INSERT INTO inventario_movimientos (taller_id, item_id, tipo, cantidad, motivo, usuario_id) VALUES ($1, $2, $3, $4, $5, $6)`,
    [tallerId, datos.itemId, datos.tipo, Math.abs(datos.cantidad), datos.motivo, datos.usuarioId],
  );
}
