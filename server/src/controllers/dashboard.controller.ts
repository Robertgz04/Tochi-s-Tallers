import type { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId } from '../utils/request';

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const datos = await dashboardService.obtenerDashboard(tallerId(req));
  responderExito(res, datos);
});
