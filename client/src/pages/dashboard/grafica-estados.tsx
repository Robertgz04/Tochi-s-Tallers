import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Car } from 'lucide-react';
import type { PuntoGrafica } from '@/pages/dashboard/grafica-ingresos';

export const COLORES_ESTADOS: Record<string, string> = {
  RECIBIDO: '#64748B',
  DIAGNOSTICO: '#3B82F6',
  ESPERANDO_AUTORIZACION: '#F59E0B',
  AUTORIZADO: '#38BDF8',
  EN_REPARACION: '#FB923C',
  PRUEBAS: '#A78BFA',
  LISTO: '#22C55E',
  ENTREGADO: '#14B8A6',
  CANCELADO: '#EF4444',
};

/** Mapea etiquetas y estados crudos al color correspondiente. */
export function colorEstado(nombre: string): string {
  const inverso: Record<string, string> = {
    Recibido: 'RECIBIDO',
    Diagnóstico: 'DIAGNOSTICO',
    'Esperando autorización': 'ESPERANDO_AUTORIZACION',
    Autorizado: 'AUTORIZADO',
    'En reparación': 'EN_REPARACION',
    Pruebas: 'PRUEBAS',
    Listo: 'LISTO',
    Entregado: 'ENTREGADO',
    Cancelado: 'CANCELADO',
  };
  return COLORES_ESTADOS[inverso[nombre] ?? nombre] ?? '#64748B';
}

interface Propiedades {
  datos: PuntoGrafica[];
}

const estiloTooltip = {
  backgroundColor: '#181D24',
  border: '1px solid #262D36',
  borderRadius: 12,
  fontSize: 12,
  color: '#F5F7FA',
};

export function GraficaEstados({ datos }: Propiedades) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Órdenes por estado</h3>
          <p className="text-xs text-muted">Distribución actual</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/10 text-info">
          <Car className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>

      {datos.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          Aún no hay órdenes registradas.
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos}
                  dataKey="valor"
                  nameKey="nombre"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {datos.map((punto) => (
                    <Cell key={punto.nombre} fill={colorEstado(punto.nombre)} />
                  ))}
                </Pie>
                <Tooltip contentStyle={estiloTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {datos.map((punto) => (
              <span
                key={punto.nombre}
                className="flex items-center gap-1.5 text-[11px] text-muted"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colorEstado(punto.nombre) }}
                  aria-hidden="true"
                />
                {punto.nombre} ({punto.valor})
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
