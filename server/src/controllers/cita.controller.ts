import type { Request, Response } from 'express';
import * as citaService from '../services/cita.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId } from '../utils/request';

const POR_PAGINA = 50;

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const pagina = Math.max(1, Number(req.query.pagina) || 1);
  const busqueda = typeof req.query.q === 'string' && req.query.q ? req.query.q : undefined;
  const estado = typeof req.query.estado === 'string' && req.query.estado ? req.query.estado : undefined;
  const desde = typeof req.query.desde === 'string' && req.query.desde ? req.query.desde : undefined;
  const hasta = typeof req.query.hasta === 'string' && req.query.hasta ? req.query.hasta : undefined;
  const resultado = await citaService.listar(tallerId(req), {
    busqueda,
    estado,
    desde,
    hasta,
    pagina,
    porPagina: POR_PAGINA,
  });
  responderExito(res, resultado);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const cita = await citaService.obtener(tallerId(req), req.params.id);
  responderExito(res, cita);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const cita = await citaService.crear(tallerId(req), req.body);
  responderExito(res, cita, 201);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const cita = await citaService.actualizar(tallerId(req), req.params.id, req.body);
  responderExito(res, cita);
});

export const cambiarEstado = asyncHandler(async (req: Request, res: Response) => {
  const cita = await citaService.cambiarEstado(tallerId(req), req.params.id, req.body.estado);
  responderExito(res, cita);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await citaService.eliminar(tallerId(req), req.params.id);
  responderExito(res, { mensaje: 'Cita eliminada correctamente.' });
});
