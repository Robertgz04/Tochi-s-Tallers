import { pool } from '../config/db';
import * as inventarioRepo from '../repositories/inventario.repository';
import { ApiError } from '../utils/ApiError';
import { traducirErrorPg } from '../utils/pgError';
import type {
  ActualizarItemInput,
  CrearItemInput,
  MovimientoInput,
} from '../validators/inventario.validators';

export interface ItemInventario {
  id: string;
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
  activo: boolean;
  stockBajo: boolean;
  fechaCreacion: string;
}

export interface ResultadoInventario {
  items: ItemInventario[];
  total: number;
  pagina: number;
  totalPaginas: number;
  stockBajoTotal: number;
  categorias: string[];
}

function aItem(fila: inventarioRepo.InventarioFila): ItemInventario {
  return {
    id: fila.id,
    sku: fila.sku,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    categoria: fila.categoria,
    unidad: fila.unidad,
    costo: Number(fila.costo),
    precio: Number(fila.precio),
    stock: fila.stock,
    stockMinimo: fila.stock_minimo,
    ubicacion: fila.ubicacion,
    activo: fila.activo,
    stockBajo: fila.stock <= fila.stock_minimo,
    fechaCreacion: fila.created_at,
  };
}

export async function listar(
  tallerId: string,
  filtros: { busqueda?: string; soloStockBajo?: boolean; categoria?: string; pagina: number; porPagina: number },
): Promise<ResultadoInventario> {
  const [{ filas, total }, stockBajoTotal, categorias] = await Promise.all([
    inventarioRepo.listarInventario(pool, tallerId, filtros),
    inventarioRepo.contarStockBajo(pool, tallerId),
    inventarioRepo.categorias(pool, tallerId),
  ]);
  return {
    items: filas.map(aItem),
    total,
    pagina: filtros.pagina,
    totalPaginas: Math.max(1, Math.ceil(total / filtros.porPagina)),
    stockBajoTotal,
    categorias,
  };
}

export async function obtener(tallerId: string, id: string): Promise<ItemInventario> {
  const fila = await inventarioRepo.buscarInventario(pool, tallerId, id);
  if (!fila) throw ApiError.noEncontrado('Producto no encontrado en tu inventario.');
  return aItem(fila);
}

export async function crear(tallerId: string, datos: CrearItemInput): Promise<ItemInventario> {
  try {
    const fila = await inventarioRepo.crearInventario(pool, tallerId, {
      sku: datos.sku,
      nombre: datos.nombre,
      descripcion: datos.descripcion || null,
      categoria: datos.categoria || null,
      unidad: datos.unidad || 'PZA',
      costo: datos.costo ?? 0,
      precio: datos.precio ?? 0,
      stock: datos.stock ?? 0,
      stockMinimo: datos.stockMinimo ?? 0,
      ubicacion: datos.ubicacion || null,
    });
    return aItem(fila);
  } catch (error) {
    traducirErrorPg(error, 'Ya existe un producto con ese SKU en tu taller.');
  }
}

export async function actualizar(
  tallerId: string,
  id: string,
  cambios: ActualizarItemInput,
): Promise<ItemInventario> {
  const existente = await inventarioRepo.buscarInventario(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Producto no encontrado en tu inventario.');
  try {
    const fila = await inventarioRepo.actualizarInventario(pool, tallerId, id, {
      sku: cambios.sku,
      nombre: cambios.nombre,
      descripcion: cambios.descripcion === undefined ? undefined : cambios.descripcion || null,
      categoria: cambios.categoria === undefined ? undefined : cambios.categoria || null,
      unidad: cambios.unidad,
      costo: cambios.costo,
      precio: cambios.precio,
      stock: cambios.stock,
      stock_minimo: cambios.stockMinimo,
      ubicacion: cambios.ubicacion === undefined ? undefined : cambios.ubicacion || null,
      activo: cambios.activo,
    });
    if (!fila) throw ApiError.noEncontrado('Producto no encontrado en tu inventario.');
    return aItem(fila);
  } catch (error) {
    traducirErrorPg(error, 'Ya existe un producto con ese SKU en tu taller.');
  }
}

export async function eliminar(tallerId: string, id: string): Promise<void> {
  const existe = await inventarioRepo.buscarInventario(pool, tallerId, id);
  if (!existe) throw ApiError.noEncontrado('Producto no encontrado en tu inventario.');
  await inventarioRepo.eliminarInventario(pool, tallerId, id);
}

export async function registrarMovimiento(tallerId: string, usuarioId: string, datos: MovimientoInput): Promise<void> {
  const item = await inventarioRepo.buscarInventario(pool, tallerId, datos.itemId);
  if (!item) throw ApiError.noEncontrado('Producto no encontrado en tu inventario.');
  if (datos.tipo === 'SALIDA' && item.stock < datos.cantidad) {
    throw ApiError.badRequest('No hay stock suficiente para registrar la salida.');
  }
  await inventarioRepo.registrarMovimiento(pool, tallerId, {
    itemId: datos.itemId,
    tipo: datos.tipo,
    cantidad: datos.cantidad,
    motivo: datos.motivo || null,
    usuarioId,
  });
}
