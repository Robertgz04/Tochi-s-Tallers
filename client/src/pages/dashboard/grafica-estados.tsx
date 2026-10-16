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
  backgroundColor: '#151a23',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 14,
  fontSize: 12,
  color: '#F8FAFC',
  boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.65)',
};

export function GraficaEstados({ datos }: Propiedades) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#12161e] p-5.5 lg:col-span-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">Órdenes por estado</h3>
          <p className="text-xs text-muted">Distribución de flujo de trabajo actual</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/15 text-info ring-1 ring-info/30 shadow-[0_0_14px_rgba(56,189,248,0.2)]">
          <Car className="h-5 w-5" aria-hidden="true" />
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
          <div className="mt-3 flex flex-wrap gap-2">
            {datos.map((punto) => (
              <span
                key={punto.nombre}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#11151e] px-2.5 py-1 text-[11px] font-medium text-muted"
              >
                <span
                  className="h-2 w-2 rounded-full shadow-[0_0_6px_currentColor]"
                  style={{ backgroundColor: colorEstado(punto.nombre), color: colorEstado(punto.nombre) }}
                  aria-hidden="true"
                />
                {punto.nombre} <strong className="text-foreground">({punto.valor})</strong>
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
