import type { PoolClient } from 'pg';
import { fechaAtras, type IdsDemo } from './demodata.base';
import type { OrdenInsertada } from './demodata.ordenes';

interface CotizacionDemo {
  folio: string;
  cliente: string;
  vehiculo: string;
  ordenFolio?: string;
  estado: string;
  total: number;
  token: string;
}

function importes(total: number): { subtotal: number; impuestos: number } {
  const subtotal = Math.round((total / 1.16) * 100) / 100;
  return { subtotal, impuestos: Math.round((total - subtotal) * 100) / 100 };
}

export async function sembrarCotizaciones(
  client: PoolClient,
  ids: IdsDemo,
  ordenes: Record<string, OrdenInsertada>,
): Promise<void> {
  const cotizaciones: CotizacionDemo[] = [
    { folio: 'COT-000001', cliente: ids.sofiaId, vehiculo: ids.rioId, ordenFolio: 'TCH-000012', estado: 'ENVIADA', total: 6200, token: 'cot-demo-8Hd92KsL01' },
    { folio: 'COT-000002', cliente: ids.luisId, vehiculo: ids.aveoId, estado: 'ENVIADA', total: 3900, token: 'cot-demo-KsL82Hd902' },
    { folio: 'COT-000003', cliente: ids.juanId, vehiculo: ids.versaId, ordenFolio: 'TCH-000009', estado: 'APROBADA', total: 4800, token: 'cot-demo-Jd91KsL03' },
    { folio: 'COT-000004', cliente: ids.anaId, vehiculo: ids.corollaId, estado: 'RECHAZADA', total: 2100, token: 'cot-demo-L82KdH04' },
    { folio: 'COT-000005', cliente: ids.juanId, vehiculo: ids.versaId, estado: 'BORRADOR', total: 1500, token: 'cot-demo-Hd05KsL9' },
  ];

  for (const cotizacion of cotizaciones) {
    const { subtotal, impuestos } = importes(cotizacion.total);
    const ordenId = cotizacion.ordenFolio ? ordenes[cotizacion.ordenFolio]?.id : null;
    const fechaAprobacion = cotizacion.estado === 'APROBADA' ? fechaAtras(2) : null;

    await client.query(
      `INSERT INTO cotizaciones (
         folio, taller_id, cliente_id, vehiculo_id, orden_id, estado,
         subtotal, impuestos, descuento, total, token_publico, fecha_aprobacion
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, $11)`,
      [
        cotizacion.folio,
        ids.tallerId,
        cotizacion.cliente,
        cotizacion.vehiculo,
        ordenId,
        cotizacion.estado,
        subtotal,
        impuestos,
        cotizacion.total,
        cotizacion.token,
        fechaAprobacion,
      ],
    );
  }
}
