import type { Request, Response } from 'express';
import * as pagoService from '../services/pago.service';
import { asyncHandler } from '../utils/asyncHandler';
import { tallerId } from '../utils/request';
import { responderExito } from '../utils/response';

const POR_PAGINA = 12;

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const pagina = Math.max(1, Number(req.query.pagina) || 1);
  const busqueda = typeof req.query.q === 'string' ? req.query.q : undefined;
  const resultado = await pagoService.listarPagos(tallerId(req), {
    busqueda,
    pagina,
    porPagina: POR_PAGINA,
  });
  responderExito(res, resultado);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const pago = await pagoService.crearPago(tallerId(req), req.body);
  responderExito(res, pago, 201);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await pagoService.eliminarPago(tallerId(req), req.params.id);
  responderExito(res, { mensaje: 'Pago eliminado correctamente.' });
});