import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

const CARPETA_MIGRACIONES = path.resolve(__dirname, '../../../database/migrations');

async function migrar(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nombre TEXT PRIMARY KEY,
      aplicado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  if (!fs.existsSync(CARPETA_MIGRACIONES)) {
    throw new Error(`No existe la carpeta de migraciones: ${CARPETA_MIGRACIONES}`);
  }

  const archivos = fs
    .readdirSync(CARPETA_MIGRACIONES)
    .filter((archivo) => archivo.endsWith('.sql'))
    .sort();

  if (archivos.length === 0) {
    console.log('No hay migraciones para aplicar.');
    return;
  }

  for (const archivo of archivos) {
    const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE nombre = $1', [
      archivo,
    ]);
    if ((aplicada.rowCount ?? 0) > 0) {
      console.log(`= ${archivo} (ya aplicada)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(CARPETA_MIGRACIONES, archivo), 'utf8');
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query(sql);
      await cliente.query('INSERT INTO schema_migrations (nombre) VALUES ($1)', [archivo]);
      await cliente.query('COMMIT');
      console.log(`+ ${archivo} aplicada correctamente.`);
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  console.log('Migraciones completadas.');
}

migrar()
  .then(() => pool.end())
  .catch((error: unknown) => {
    console.error('Error al aplicar migraciones:', error instanceof Error ? error.message : error);
    process.exit(1);
  });
