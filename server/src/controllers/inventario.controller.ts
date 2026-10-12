import type { Request, Response } from 'express';
import * as inventarioService from '../services/inventario.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId, usuario } from '../utils/request';

const POR_PAGINA = 12;

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const pagina = Math.max(1, Number(req.query.pagina) || 1);
  const busqueda = typeof req.query.q === 'string' && req.query.q ? req.query.q : undefined;
  const categoria = typeof req.query.categoria === 'string' && req.query.categoria ? req.query.categoria : undefined;
  const soloStockBajo = req.query.stockBajo === 'true' || req.query.stockBajo === '1';
  const resultado = await inventarioService.listar(tallerId(req), {
    busqueda,
    categoria,
    soloStockBajo,
    pagina,
    porPagina: POR_PAGINA,
  });
  responderExito(res, resultado);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventarioService.obtener(tallerId(req), req.params.id);
  responderExito(res, item);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventarioService.crear(tallerId(req), req.body);
  responderExito(res, item, 201);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventarioService.actualizar(tallerId(req), req.params.id, req.body);
  responderExito(res, item);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await inventarioService.eliminar(tallerId(req), req.params.id);
  responderExito(res, { mensaje: 'Producto eliminado correctamente.' });
});

export const movimiento = asyncHandler(async (req: Request, res: Response) => {
  await inventarioService.registrarMovimiento(tallerId(req), usuario(req).id, req.body);
  const item = await inventarioService.obtener(tallerId(req), req.body.itemId);
  responderExito(res, item);
});
