import type { Request, Response } from 'express';
import * as tallerService from '../services/taller.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId } from '../utils/request';

export const obtenerMio = asyncHandler(async (req: Request, res: Response) => {
  const taller = await tallerService.obtenerMiTaller(tallerId(req));
  responderExito(res, taller);
});

export const actualizarMio = asyncHandler(async (req: Request, res: Response) => {
  const taller = await tallerService.actualizarMiTaller(tallerId(req), req.body);
  responderExito(res, taller);
});
