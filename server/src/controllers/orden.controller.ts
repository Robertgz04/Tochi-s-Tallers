import type { Request, Response } from 'express';
import * as ordenService from '../services/orden.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId } from '../utils/request';

const POR_PAGINA = 12;

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const pagina = Math.max(1, Number(req.query.pagina) || 1);
  const estado = typeof req.query.estado === 'string' && req.query.estado ? req.query.estado : undefined;
  const busqueda = typeof req.query.q === 'string' ? req.query.q : undefined;

  const resultado = await ordenService.listarOrdenes(tallerId(req), {
    estado,
    busqueda,
    pagina,
    porPagina: POR_PAGINA,
  });
  responderExito(res, resultado);
});

export const estados = asyncHandler(async (req: Request, res: Response) => {
  const conteos = await ordenService.contarPorEstado(tallerId(req));
  responderExito(res, conteos);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const orden = await ordenService.obtenerOrden(tallerId(req), req.params.id);
  responderExito(res, orden);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const nueva = await ordenService.crearOrden(tallerId(req), req.body);
  responderExito(res, nueva, 201);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const actualizada = await ordenService.actualizarOrden(tallerId(req), req.params.id, req.body);
  responderExito(res, actualizada);
});

export const cambiarEstado = asyncHandler(async (req: Request, res: Response) => {
  const orden = await ordenService.cambiarEstado(tallerId(req), req.params.id, req.body.estado);
  responderExito(res, orden);
});
