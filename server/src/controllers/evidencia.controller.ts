import fs from 'fs';
import type { Request, Response } from 'express';
import * as evidenciaService from '../services/evidencia.service';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { tallerId, usuario } from '../utils/request';
import { responderExito } from '../utils/response';
import type { SubirEvidenciaInput } from '../validators/evidencia.validators';
import type { EtapaEvidencia } from '../repositories/evidencia.repository';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const evidencias = await evidenciaService.listarEvidencias(tallerId(req), req.params.id);
  responderExito(res, evidencias);
});

export const subir = asyncHandler(async (req: Request, res: Response) => {
  const archivo = req.file;
  if (!archivo) {
    throw ApiError.badRequest('Debes adjuntar una imagen en el campo "foto".');
  }
  const datos = req.body as SubirEvidenciaInput;
  try {
    const evidencia = await evidenciaService.subirEvidencia(tallerId(req), req.params.id, {
      archivo,
      etapa: datos.etapa as EtapaEvidencia,
      descripcion: datos.descripcion?.trim() ? datos.descripcion.trim() : null,
      usuarioId: (() => {
        try {
          return usuario(req).id;
        } catch {
          return null;
        }
      })(),
    });
    responderExito(res, evidencia, 201);
  } catch (error) {
    // Si el servicio falla antes de mover el archivo, limpiar el temporal
    fs.rmSync(archivo.path, { force: true });
    throw error;
  }
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await evidenciaService.eliminarEvidencia(tallerId(req), req.params.id, req.params.evidenciaId);
  responderExito(res, { eliminado: true });
});
