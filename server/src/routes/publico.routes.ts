import { Router } from 'express';
import * as cotizacionPublicoService from '../services/cotizacionPublico.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { authLimiter } from '../middlewares/rateLimiter';

/**
 * Rutas PÚBLICAS para que el cliente final vea y responda una cotización
 * con su token único, sin necesidad de iniciar sesión.
 */
export const publicoRoutes = Router();

publicoRoutes.get(
  '/cotizaciones/:token',
  asyncHandler(async (req, res) => {
    const cotizacion = await cotizacionPublicoService.obtenerPublica(req.params.token);
    responderExito(res, cotizacion);
  }),
);

publicoRoutes.post(
  '/cotizaciones/:token/respuesta',
  authLimiter,
  asyncHandler(async (req, res) => {
    const aprobada = req.body?.aprobada === true;
    const cotizacion = await cotizacionPublicoService.responderPublica(req.params.token, aprobada);
    responderExito(res, cotizacion);
  }),
);
