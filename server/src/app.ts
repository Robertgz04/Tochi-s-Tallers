import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { verificarConexion } from './config/db';
import { errorHandlerGlobal, noEncontrado } from './middlewares/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { citaRoutes } from './routes/cita.routes';
import { clienteRoutes } from './routes/cliente.routes';
import { cotizacionRoutes } from './routes/cotizacion.routes';
import { inventarioRoutes } from './routes/inventario.routes';
import { ordenRoutes } from './routes/orden.routes';
import { pagoRoutes } from './routes/pago.routes';
import { publicoRoutes } from './routes/publico.routes';
import { tallerRoutes } from './routes/taller.routes';
import { reportesRoutes } from './routes/reportes.routes';
import { usuarioRoutes } from './routes/usuario.routes';
import { vehiculoRoutes } from './routes/vehiculo.routes';

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
  app.use('/api/clientes', clienteRoutes);
  app.use('/api/vehiculos', vehiculoRoutes);
  app.use('/api/ordenes', ordenRoutes);
  app.use('/api/cotizaciones', cotizacionRoutes);
  app.use('/api/pagos', pagoRoutes);
  app.use('/api/inventario', inventarioRoutes);
  app.use('/api/citas', citaRoutes);
  app.use('/api/publico', publicoRoutes);

  app.use(noEncontrado);
  app.use(errorHandlerGlobal);

  return app;
}
