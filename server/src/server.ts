import { crearApp } from './app';
import { env } from './config/env';
import { pool, verificarConexion } from './config/db';

const app = crearApp();

const servidor = app.listen(env.PORT, async () => {
  const conectado = await verificarConexion();
  console.log(`API de Tochi'sTaller escuchando en http://localhost:${env.PORT}`);
  console.log(
    conectado
      ? 'PostgreSQL: conectado correctamente.'
      : 'PostgreSQL: SIN CONEXIÓN — revisa el archivo .env y que el servicio esté corriendo.',
  );
});

function apagar(signal: string): void {
  console.log(`\nRecibida ${signal}. Cerrando servidor...`);
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));
