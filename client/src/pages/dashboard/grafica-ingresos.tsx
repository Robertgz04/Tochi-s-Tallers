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
import { useColoresGrafica } from '@/lib/graficas';

export interface PuntoGrafica {
  nombre: string;
  valor: number;
}

interface Propiedades {
  datos: PuntoGrafica[];
}

export function GraficaIngresos({ datos }: Propiedades) {
  const { estiloTooltip, colorCuadricula } = useColoresGrafica();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card to-surface p-5.5 lg:col-span-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">Ingresos del taller</h3>
          <p className="text-xs text-muted">Historial financiero de los últimos 6 meses</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_14px_rgba(245,158,11,0.2)]">
          <DollarSign className="h-5 w-5" aria-hidden="true" />
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
            <CartesianGrid stroke={colorCuadricula} strokeDasharray="4 6" vertical={false} />
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
