import { Pool, PoolClient, types } from 'pg';
import { env } from './env';

// Devolver números (no strings) para bigint y numeric: los montos y conteos se usan como número.
types.setTypeParser(types.builtins.INT8, (valor) => Number(valor));
types.setTypeParser(types.builtins.NUMERIC, (valor) => Number(valor));

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (error) => {
  console.error('[db] Error inesperado en el pool de PostgreSQL:', error.message);
});

/** Ejecutor de consultas: funciona con el pool o con una transacción. */
export type QueryExec = Pick<Pool, 'query'>;

export async function withTransaction<T>(operacion: (cliente: PoolClient) => Promise<T>): Promise<T> {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await operacion(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
}

export async function verificarConexion(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
