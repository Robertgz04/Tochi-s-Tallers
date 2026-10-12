import { pool, withTransaction } from '../config/db';
import { PASSWORD_DEMO, sembrarBase } from './demodata.base';
import { sembrarOrdenes } from './demodata.ordenes';
import { sembrarCotizaciones } from './demodata.cotizaciones';

async function sembrar(): Promise<void> {
  const existente = await pool.query('SELECT id FROM talleres WHERE correo = $1', [
    'contacto@tochisgarage.test',
  ]);

  if ((existente.rowCount ?? 0) > 0) {
    console.log(`Los datos demo ya fueron insertados (taller "Tochi's Garage" existe).`);
    console.log('Si deseas re-sembrar, crea una base de datos nueva y vuelve a ejecutar.');
    return;
  }

  await withTransaction(async (cliente) => {
    const ids = await sembrarBase(cliente);
    const ordenes = await sembrarOrdenes(cliente, ids);
    await sembrarCotizaciones(cliente, ids, ordenes);
  });

  console.log('Datos demo insertados correctamente.');
  console.log('----------------------------------------');
  console.log(`Taller:    Tochi's Garage`);
  console.log(`Login:     admin@tochistaller.test / ${PASSWORD_DEMO}`);
  console.log(`Mecánico:  mecanico@tochistaller.test / ${PASSWORD_DEMO}`);
  console.log(`Recepción: recepcion@tochistaller.test / ${PASSWORD_DEMO}`);
  console.log('----------------------------------------');
  console.log('Estos datos son SOLO de demostración y pueden borrarse en cualquier momento.');
}

sembrar()
  .then(() => pool.end())
  .catch((error: unknown) => {
    console.error('Error al insertar datos demo:', error instanceof Error ? error.message : error);
    process.exit(1);
  });
