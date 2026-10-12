import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DollarSign } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

export interface PuntoGrafica {
  nombre: string;
  valor: number;
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

export function GraficaIngresos({ datos }: Propiedades) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Ingresos</h3>
          <p className="text-xs text-muted">Últimos 6 meses</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <DollarSign className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="gradienteIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#262D36" strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="nombre"
              tick={{ fill: '#98A2B3', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#98A2B3', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(valor: number) =>
                valor >= 1000 ? `${Math.round(valor / 1000)}k` : String(valor)
              }
            />
            <Tooltip
              contentStyle={estiloTooltip}
              formatter={(valor) => [formatMoney(Number(valor)), 'Ingresos']}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#F59E0B"
              strokeWidth={2.5}
              fill="url(#gradienteIngresos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted">Importes en MXN</p>
    </section>
  );
}
