import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CreditCard, DollarSign, PieChart as PieIcon, Sparkles } from 'lucide-react';
import { formatMoney, formatNumber } from '@/lib/utils';
import { ETIQUETAS_METODO_PAGO, type MetodoPago } from '@/types';

export interface MetodoGrafica {
  metodo: string;
  nombre: string;
  monto: number;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface Propiedades {
  ingresosPorMetodo: {
    metodo: MetodoPago;
    monto: number;
    cantidad: number;
  }[];
}

const PALETA_METODOS: Record<string, string> = {
  EFECTIVO: '#10B981', // Verde esmeralda
  TARJETA_CREDITO: '#38BDF8', // Azul cielo
  TARJETA_DEBITO: '#6366F1', // Indigo
  TRANSFERENCIA: '#F59E0B', // Ámbar
  CHEQUE: '#EC4899', // Rosa
  OTRO: '#94A3B8', // Slate
};

const estiloTooltip = {
  backgroundColor: '#151a23',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 14,
  fontSize: 12,
  color: '#F8FAFC',
  boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.65)',
};

export function GraficaMetodosPago({ ingresosPorMetodo }: Propiedades) {
  const { datos, totalMonto, totalOperaciones } = useMemo(() => {
    const total = ingresosPorMetodo.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    const transacciones = ingresosPorMetodo.reduce(
      (acc, curr) => acc + Number(curr.cantidad || 0),
      0,
    );

    const items: MetodoGrafica[] = ingresosPorMetodo.map((item) => {
      const monto = Number(item.monto) || 0;
      const pct = total > 0 ? (monto / total) * 100 : 0;
      return {
        metodo: item.metodo,
        nombre: ETIQUETAS_METODO_PAGO[item.metodo] ?? item.metodo,
        monto,
        cantidad: Number(item.cantidad) || 0,
        porcentaje: Math.round(pct * 10) / 10,
        color: PALETA_METODOS[item.metodo] ?? '#94A3B8',
      };
    });

    return {
      datos: items.sort((a, b) => b.monto - a.monto),
      totalMonto: total,
      totalOperaciones: transacciones,
    };
  }, [ingresosPorMetodo]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#12161e] p-5.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30 shadow-[0_0_14px_rgba(56,189,248,0.2)]">
            <PieIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Distribución de Cobranza por Canal
              </h3>
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                Mix de Pago
              </span>
            </div>
            <p className="text-xs text-muted">
              Participación porcentual y montos por cada método de recepción de fondos.
            </p>
          </div>
        </div>
      </div>

      {datos.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          Aún no hay pagos registrados para graficar.
        </div>
      ) : (
        <div className="mt-4 grid items-center gap-6 lg:grid-cols-12">
          {/* Dona con Donut Recharts */}
          <div className="relative flex flex-col items-center justify-center lg:col-span-5">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datos}
                    dataKey="monto"
                    nameKey="nombre"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {datos.map((entry) => (
                      <Cell key={entry.metodo} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={estiloTooltip}
                    formatter={(valor, name) => [
                      formatMoney(Number(valor)),
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Texto en el centro de la dona */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Total Recaudado
              </span>
              <span className="text-lg font-black text-foreground">
                {formatMoney(totalMonto)}
              </span>
              <span className="text-[10px] font-medium text-emerald-400">
                {totalOperaciones} pagos
              </span>
            </div>
          </div>

          {/* Tarjetas informativas por método */}
          <div className="space-y-2 lg:col-span-7">
            {datos.map((item) => (
              <div
                key={item.metodo}
                className="group relative flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#11151e] p-3 transition-all hover:border-white/20 hover:bg-[#141a26]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-3.5 w-3.5 shrink-0 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: item.color, color: item.color }}
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.nombre}
                    </p>
                    <p className="text-[11px] text-muted">
                      {formatNumber(item.cantidad)} transacción(es) registrada(s)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-extrabold tabular-nums text-foreground">
                    {formatMoney(item.monto)}
                  </p>
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      border: `1px solid ${item.color}40`,
                    }}
                  >
                    {item.porcentaje}%
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Canal predominante: {datos[0]?.nombre} ({datos[0]?.porcentaje}%)
              </span>
              <span className="font-bold">{formatMoney(datos[0]?.monto ?? 0)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

