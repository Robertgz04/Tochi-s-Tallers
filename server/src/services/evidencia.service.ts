import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';
import { CARPETA_UPLOADS } from '../middlewares/upload';
import * as evidenciaRepo from '../repositories/evidencia.repository';
import * as ordenRepo from '../repositories/orden.repository';
import { ApiError } from '../utils/ApiError';
import type { EtapaEvidencia } from '../repositories/evidencia.repository';

export interface Evidencia {
  id: string;
  ordenId: string;
  etapa: EtapaEvidencia;
  url: string;
  nombreArchivo: string | null;
  mime: string | null;
  tamanoBytes: number;
  descripcion: string | null;
  creadoPor: string | null;
  creadoPorNombre: string | null;
  createdAt: string;
}

function aEvidencia(fila: evidenciaRepo.EvidenciaFila): Evidencia {
  return {
    id: fila.id,
    ordenId: fila.orden_id,
    etapa: fila.etapa,
    url: fila.url,
    nombreArchivo: fila.nombre_archivo,
    mime: fila.mime,
    tamanoBytes: fila.tamano_bytes,
    descripcion: fila.descripcion,
    creadoPor: fila.creado_por,
    creadoPorNombre: fila.creado_por_nombre?.trim() ? fila.creado_por_nombre : null,
    createdAt: fila.created_at,
  };
}

async function verificarOrden(tallerId: string, ordenId: string): Promise<void> {
  const orden = await ordenRepo.buscarOrden(pool, tallerId, ordenId);
  if (!orden) throw ApiError.noEncontrado('Orden no encontrada en tu taller.');
}

function rutaFisicaDesdeUrl(url: string): string | null {
  // Las URL que generamos son de la forma /uploads/{taller}/{orden}/{archivo}
  const partes = url.split('/').filter(Boolean);
  if (partes[0] !== 'uploads' || partes.length < 4) return null;
  const relativa = partes.slice(1).join('/');
  const base = path.resolve(CARPETA_UPLOADS);
  const destino = path.resolve(base, relativa);
  if (!destino.startsWith(base)) return null; // anti path traversal
  return destino;
}

export async function listarEvidencias(tallerId: string, ordenId: string): Promise<Evidencia[]> {
  await verificarOrden(tallerId, ordenId);
  const filas = await evidenciaRepo.listarPorOrden(pool, tallerId, ordenId);
  return filas.map(aEvidencia);
}

export interface SubirEvidenciaInput {
  archivo: Express.Multer.File;
  etapa: EtapaEvidencia;
  descripcion: string | null;
  usuarioId: string | null;
}

export async function subirEvidencia(
  tallerId: string,
  ordenId: string,
  entrada: SubirEvidenciaInput,
): Promise<Evidencia> {
  await verificarOrden(tallerId, ordenId);

  // Mover de tmp/ a su carpeta definitiva: uploads/{tallerId}/{ordenId}/{archivo}
  const carpetaDestino = path.join(CARPETA_UPLOADS, tallerId, ordenId);
  fs.mkdirSync(carpetaDestino, { recursive: true });
  const nombreFinal = path.basename(entrada.archivo.filename);
  const rutaFinal = path.join(carpetaDestino, nombreFinal);
  try {
    fs.renameSync(entrada.archivo.path, rutaFinal);
  } catch {
    throw new ApiError(500, 'No se pudo guardar la imagen en el servidor.');
  }

  const url = `/uploads/${tallerId}/${ordenId}/${nombreFinal}`;
  try {
    const fila = await evidenciaRepo.crear(pool, tallerId, ordenId, {
      etapa: entrada.etapa,
      url,
      nombreArchivo: entrada.archivo.originalname,
      mime: entrada.archivo.mimetype,
      tamanoBytes: entrada.archivo.size,
      descripcion: entrada.descripcion,
      creadoPor: entrada.usuarioId,
    });
    return aEvidencia(fila);
  } catch (error) {
    // Si falla la BD, no dejar el archivo huérfano
    fs.rmSync(rutaFinal, { force: true });
    throw error;
  }
}

export async function eliminarEvidencia(
  tallerId: string,
  ordenId: string,
  evidenciaId: string,
): Promise<void> {
  await verificarOrden(tallerId, ordenId);
  const existente = await evidenciaRepo.buscarPorId(pool, tallerId, ordenId, evidenciaId);
  if (!existente) throw ApiError.noEncontrado('Evidencia no encontrada en esta orden.');

  const eliminada = await evidenciaRepo.eliminar(pool, tallerId, ordenId, evidenciaId);
  if (!eliminada) throw ApiError.noEncontrado('Evidencia no encontrada en esta orden.');

  const ruta = rutaFisicaDesdeUrl(existente.url);
  if (ruta) fs.rmSync(ruta, { force: true });
}
