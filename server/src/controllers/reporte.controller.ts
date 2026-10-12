import type { Request, Response } from 'express';
import * as reporteService from '../services/reporte.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId } from '../utils/request';

export const resumen = asyncHandler(async (req: Request, res: Response) => {
  const datos = await reporteService.obtenerResumen(tallerId(req));
  responderExito(res, datos);
});
