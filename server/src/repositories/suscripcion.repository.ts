import type { QueryExec } from '../config/db';

export interface NuevaSuscripcion {
  tallerId: string;
  plan: string;
  monto: number;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: string;
}

export async function crearSuscripcion(db: QueryExec, datos: NuevaSuscripcion): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO suscripciones (taller_id, plan, monto, fecha_inicio, fecha_vencimiento, estado)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      datos.tallerId,
      datos.plan,
      datos.monto,
      datos.fechaInicio,
      datos.fechaVencimiento,
      datos.estado,
    ],
  );
  return rows[0].id;
}
