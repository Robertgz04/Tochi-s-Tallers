import type { PoolClient } from 'pg';
import { fechaMesAtras, fechaReciente, type IdsDemo } from './demodata.base';

interface OrdenDemo {
  folio: string;
  cliente: string;
  vehiculo: string;
  fecha: Date;
  estado: string;
  descripcion: string;
  diagnostico: string;
  total: number;
  kilometraje: number;
  pago?: { monto: number; metodo: string; referencia?: string };
}

export interface OrdenInsertada {
  id: string;
  clienteId: string;
  vehiculoId: string;
  total: number;
}

function importes(total: number): { subtotal: number; impuestos: number } {
  const subtotal = Math.round((total / 1.16) * 100) / 100;
  return { subtotal, impuestos: Math.round((total - subtotal) * 100) / 100 };
}

const ordenesDemo: OrdenDemo[] = [
  { folio: 'TCH-000001', cliente: '', vehiculo: '', fecha: fechaMesAtras(5, 20), estado: 'ENTREGADO', descripcion: 'Cambio de aceite y filtros', diagnostico: 'Mantenimiento preventivo de 100,000 km', total: 3200, kilometraje: 85000, pago: { monto: 3200, metodo: 'EFECTIVO' } },
  { folio: 'TCH-000002', cliente: '', vehiculo: '', fecha: fechaMesAtras(4, 18), estado: 'ENTREGADO', descripcion: 'Ruido al frenar', diagnostico: 'Balatas delanteras al 10%, reemplazo', total: 1850, kilometraje: 61000, pago: { monto: 1850, metodo: 'TARJETA', referencia: 'AUTH-4471' } },
  { folio: 'TCH-000003', cliente: '', vehiculo: '', fecha: fechaMesAtras(3, 22), estado: 'ENTREGADO', descripcion: 'No enciende en las mañanas', diagnostico: 'Batería descargada, se reemplazó', total: 5400, kilometraje: 128000, pago: { monto: 5400, metodo: 'TRANSFERENCIA', referencia: 'SPEI-9921' } },
  { folio: 'TCH-000004', cliente: '', vehiculo: '', fecha: fechaMesAtras(2, 15), estado: 'ENTREGADO', descripcion: 'Servicio de 50,000 km', diagnostico: 'Cambio de aceite, filtros y frenos', total: 2450, kilometraje: 50000, pago: { monto: 2450, metodo: 'EFECTIVO' } },
  { folio: 'TCH-000005', cliente: '', vehiculo: '', fecha: fechaMesAtras(1, 12), estado: 'ENTREGADO', descripcion: 'Vibración al frenar', diagnostico: 'Discos rectificados y balatas nuevas', total: 4800, kilometraje: 89500, pago: { monto: 4800, metodo: 'TRANSFERENCIA', referencia: 'SPEI-1188' } },
  { folio: 'TCH-000006', cliente: '', vehiculo: '', fecha: fechaMesAtras(1, 25), estado: 'ENTREGADO', descripcion: 'Luz del motor encendida', diagnostico: 'Código P0420: cambio de sonda lambda', total: 1200, kilometraje: 65000, pago: { monto: 1200, metodo: 'TARJETA', referencia: 'AUTH-5520' } },
  { folio: 'TCH-000007', cliente: '', vehiculo: '', fecha: fechaReciente(6), estado: 'ENTREGADO', descripcion: 'Cambio de aceite', diagnostico: 'Mantenimiento preventivo', total: 2450, kilometraje: 134000, pago: { monto: 2450, metodo: 'EFECTIVO' } },
  { folio: 'TCH-000008', cliente: '', vehiculo: '', fecha: fechaReciente(3), estado: 'ENTREGADO', descripcion: 'Aire acondicionado sin enfriar', diagnostico: 'Recarga de gas y limpieza de evaporador', total: 1800, kilometraje: 44500, pago: { monto: 1800, metodo: 'TARJETA', referencia: 'AUTH-6033' } },
  { folio: 'TCH-000009', cliente: '', vehiculo: '', fecha: fechaReciente(2), estado: 'EN_REPARACION', descripcion: 'Ruido en suspensión trasera', diagnostico: 'Cambio de terminales y balatas en curso', total: 4800, kilometraje: 92450, pago: { monto: 2000, metodo: 'EFECTIVO' } },
  { folio: 'TCH-000010', cliente: '', vehiculo: '', fecha: fechaReciente(0), estado: 'DIAGNOSTICO', descripcion: 'Revisión general antes de viaje', diagnostico: 'En diagnóstico', total: 0, kilometraje: 68300 },
  { folio: 'TCH-000011', cliente: '', vehiculo: '', fecha: fechaReciente(4), estado: 'LISTO', descripcion: 'Cambio de balatas delanteras', diagnostico: 'Trabajo finalizado, pendiente de entrega', total: 3500, kilometraje: 134900 },
  { folio: 'TCH-000012', cliente: '', vehiculo: '', fecha: fechaReciente(5), estado: 'ESPERANDO_AUTORIZACION', descripcion: 'Fuga de refrigerante', diagnostico: 'Cambio de manguera y abrazaderas', total: 6200, kilometraje: 45200 },
  { folio: 'TCH-000013', cliente: '', vehiculo: '', fecha: fechaMesAtras(2, 28), estado: 'CANCELADO', descripcion: 'Diagnóstico de transmisión', diagnostico: 'Cancelada por el cliente', total: 900, kilometraje: 91000 },
];

/** Asigna cliente/vehículo reales según el patrón demo por folio. */
function resolverRelaciones(orden: OrdenDemo, ids: IdsDemo): OrdenDemo {
  const porVehiculo: Record<string, { cliente: string; vehiculo: string }> = {
    'TCH-000001': { cliente: ids.juanId, vehiculo: ids.versaId },
    'TCH-000002': { cliente: ids.anaId, vehiculo: ids.corollaId },
    'TCH-000003': { cliente: ids.luisId, vehiculo: ids.aveoId },
    'TCH-000004': { cliente: ids.sofiaId, vehiculo: ids.rioId },
    'TCH-000005': { cliente: ids.juanId, vehiculo: ids.versaId },
    'TCH-000006': { cliente: ids.anaId, vehiculo: ids.corollaId },
    'TCH-000007': { cliente: ids.luisId, vehiculo: ids.aveoId },
    'TCH-000008': { cliente: ids.sofiaId, vehiculo: ids.rioId },
    'TCH-000009': { cliente: ids.juanId, vehiculo: ids.versaId },
    'TCH-000010': { cliente: ids.anaId, vehiculo: ids.corollaId },
    'TCH-000011': { cliente: ids.luisId, vehiculo: ids.aveoId },
    'TCH-000012': { cliente: ids.sofiaId, vehiculo: ids.rioId },
    'TCH-000013': { cliente: ids.juanId, vehiculo: ids.versaId },
  };
  const rel = porVehiculo[orden.folio];
  return { ...orden, cliente: rel.cliente, vehiculo: rel.vehiculo };
}

export async function sembrarOrdenes(
  client: PoolClient,
  ids: IdsDemo,
): Promise<Record<string, OrdenInsertada>> {
  const insertadas: Record<string, OrdenInsertada> = {};

  for (const ordenDemo of ordenesDemo) {
    const orden = resolverRelaciones(ordenDemo, ids);
    const { subtotal, impuestos } = importes(orden.total);
    const fechaFinalizacion =
      orden.estado === 'ENTREGADO' ? new Date(orden.fecha.getTime() + 3 * 86_400_000) : null;

    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO ordenes_trabajo (
         folio, taller_id, cliente_id, vehiculo_id, mecanico_id, fecha_ingreso,
         fecha_finalizacion, kilometraje_entrada, descripcion_cliente, diagnostico,
         estado, subtotal, impuestos, descuento, total
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, $14)
       RETURNING id`,
      [
        orden.folio,
        ids.tallerId,
        orden.cliente,
        orden.vehiculo,
        ids.mecanicoId,
        orden.fecha,
        fechaFinalizacion,
        orden.kilometraje,
        orden.descripcion,
        orden.diagnostico,
        orden.estado,
        orden.total > 0 ? subtotal : 0,
        orden.total > 0 ? impuestos : 0,
        orden.total,
      ],
    );

    const ordenId = rows[0].id;
    insertadas[orden.folio] = {
      id: ordenId,
      clienteId: orden.cliente,
      vehiculoId: orden.vehiculo,
      total: orden.total,
    };

    if (orden.pago) {
      await client.query(
        `INSERT INTO pagos (taller_id, orden_id, cliente_id, monto, metodo_pago, referencia, fecha_pago)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          ids.tallerId,
          ordenId,
          orden.cliente,
          orden.pago.monto,
          orden.pago.metodo,
          orden.pago.referencia ?? null,
          orden.fecha,
        ],
      );
    }
  }

  return insertadas;
}

