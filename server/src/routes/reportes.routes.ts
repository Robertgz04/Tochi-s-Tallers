import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import * as reporteController from '../controllers/reporte.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tallerMiddleware } from '../middlewares/tallerMiddleware';

export const reportesRoutes = Router();

reportesRoutes.use(authMiddleware, tallerMiddleware);

reportesRoutes.get('/dashboard', dashboardController.dashboard);
reportesRoutes.get('/resumen', reporteController.resumen);
