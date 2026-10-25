import { useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { ArrowUpRight, Banknote, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { useColoresGrafica } from '@/lib/graficas';
import { useI18nStore } from '@/store/i18nStore';

export interface DatosFacturacionCobro {
  mes: string;
  nombreMes: string;
  facturado: number;
  cobrado: number;
  saldo: number;
  ordenes: number;
}

interface Propiedades {
  ordenesPorMes: { mes: string; ordenes: number; facturado: number }[];
  ingresosMensuales: { mes: string; total: number }[];
}

export function GraficaFacturacionCobro({ ordenesPorMes, ingresosMensuales }: Propiedades) {
  const [vista, setVista] = useState<'comparativo' | 'acumulado'>('comparativo');
  const { estiloTooltip, colorCuadricula } = useColoresGrafica();
  const { t, idioma } = useI18nStore();
  const locale = idioma === 'en' ? enUS : es;

  const datos = useMemo<DatosFacturacionCobro[]>(() => {
    // Mapa de ingresos cobrados indexados por mes "YYYY-MM"
    const cobradoPorMes = new Map<string, number>();
    for (const item of ingresosMensuales) {
      cobradoPorMes.set(item.mes, item.total);
    }

    // Tomar los últimos 6 meses de ordenesPorMes
    return ordenesPorMes.map((item) => {
      let nombreMes = item.mes;
      try {
        nombreMes = format(parseISO(`${item.mes}-01`), "MMM ''yy", { locale });
      } catch {
        // fallback
      }
      const facturado = Number(item.facturado) || 0;
      const cobrado = cobradoPorMes.get(item.mes) ?? 0;
      return {
        mes: item.mes,
        nombreMes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
        facturado,
        cobrado,
        saldo: Math.max(facturado - cobrado, 0),
        ordenes: item.ordenes,
      };
    });
  }, [ordenesPorMes, ingresosMensuales, locale]);

  const totales = useMemo(() => {
    const totalFacturado = datos.reduce((acc, curr) => acc + curr.facturado, 0);
    const totalCobrado = datos.reduce((acc, curr) => acc + curr.cobrado, 0);
    const tasaCobro = totalFacturado > 0 ? Math.round((totalCobrado / totalFacturado) * 100) : 100;
    const pendiente = Math.max(totalFacturado - totalCobrado, 0);
    return { totalFacturado, totalCobrado, tasaCobro, pendiente };
  }, [datos]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card to-surface p-5.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_14px_rgba(16,185,129,0.2)]">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                {t('rep.factVsCobro')}
              </h3>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {t('rep.comparativoReal')}
              </span>
            </div>
            <p className="text-xs text-muted">
              {t('rep.facturacionDescripcion')}
            </p>
          </div>
        </div>

        {/* Selector de modo */}
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-card p-1">
          <button
            type="button"
            onClick={() => setVista('comparativo')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              vista === 'comparativo'
                ? 'bg-primary text-black shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {t('rep.barrasDobles')}
          </button>
          <button
            type="button"
            onClick={() => setVista('acumulado')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              vista === 'acumulado'
                ? 'bg-primary text-black shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {t('rep.apilado')}
          </button>
        </div>
      </div>

      {/* Tarjetas KPI rápidas */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-background/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{t('rep.facturadoTotal')}</p>
          <p className="mt-1 text-base font-extrabold text-sky-400 tabular-nums">
            {formatMoney(totales.totalFacturado)}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-background/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{t('rep.cobradoEfectivo')}</p>
          <p className="mt-1 text-base font-extrabold text-emerald-400 tabular-nums">
            {formatMoney(totales.totalCobrado)}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-background/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{t('rep.tasaCobro')}</p>
          <p className="mt-1 flex items-center gap-1 text-base font-extrabold text-amber-400 tabular-nums">
            <CheckCircle2 className="h-4 w-4" />
            {totales.tasaCobro}%
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-background/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{t('rep.porRecuperar')}</p>
          <p className="mt-1 flex items-center gap-1 text-base font-extrabold text-rose-400 tabular-nums">
            <ArrowUpRight className="h-4 w-4" />
            {formatMoney(totales.pendiente)}
          </p>
        </div>
      </div>

      {/* Gráfica */}
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            margin={{ top: 12, right: 8, left: -10, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid stroke={colorCuadricula} strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="nombreMes"
              tick={{ fill: '#98A2B3', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#98A2B3', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(valor: number) =>
                valor >= 1000 ? `$${Math.round(valor / 1000)}k` : `$${valor}`
              }
            />
            <Tooltip
              contentStyle={estiloTooltip}
              formatter={(valor, name) => [
                formatMoney(Number(valor)),
                name === 'facturado' ? t('rep.facturadoTotal') : t('rep.importeCobrado'),
              ]}
              labelFormatter={(label) => `${t('rep.periodo')}: ${label}`}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
              formatter={(value) => (
                <span className="text-xs font-medium text-muted">
                  {value === 'facturado' ? t('rep.facturado') : t('rep.cobrado')}
                </span>
              )}
            />
            <Bar
              dataKey="facturado"
              name="facturado"
              fill="#38BDF8"
              radius={vista === 'acumulado' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
              stackId={vista === 'acumulado' ? 'a' : undefined}
              maxBarSize={38}
            />
            <Bar
              dataKey="cobrado"
              name="cobrado"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
              stackId={vista === 'acumulado' ? 'a' : undefined}
              maxBarSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Banknote className="h-4 w-4 text-emerald-400" />
          Montos en moneda nacional (MXN)
        </span>
        <span className="text-[11px] text-muted">
          Últimos {datos.length} meses analizados
        </span>
      </div>
    </section>
  );
}
