import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { verificarConexion } from './config/db';
import { errorHandlerGlobal, noEncontrado } from './middlewares/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { tallerRoutes } from './routes/taller.routes';
import { reportesRoutes } from './routes/reportes.routes';
import { usuarioRoutes } from './routes/usuario.routes';

export function crearApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((origen) => origen.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/salud', async (_req, res) => {
    const conectado = await verificarConexion();
    res.json({
      success: true,
      data: {
        servidor: 'tochistaller-api',
        estado: conectado ? 'ok' : 'sin_base_datos',
        baseDatos: conectado ? 'conectada' : 'no conectada',
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/usuarios', usuarioRoutes);
  app.use('/api/talleres', tallerRoutes);
  app.use('/api/reportes', reportesRoutes);

  app.use(noEncontrado);
  app.use(errorHandlerGlobal);

  return app;
}
