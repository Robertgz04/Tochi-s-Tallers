import { useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Award, DollarSign, Hammer, Wrench } from 'lucide-react';
import { formatMoney, formatNumber } from '@/lib/utils';
import { useColoresGrafica } from '@/lib/graficas';
import { useI18nStore } from '@/store/i18nStore';

export interface MecanicoRendimiento {
  mecanicoId: string;
  mecanico: string;
  ordenes: number;
  facturado: number;
  promedioOrden: number;
}

interface Propiedades {
  topMecanicos: {
    mecanicoId: string;
    mecanico: string;
    ordenes: number;
    facturado: number;
  }[];
}

const COLORES_RANKING = ['#F59E0B', '#38BDF8', '#A78BFA', '#10B981', '#FB923C', '#64748B'];

export function GraficaRendimientoMecanicos({ topMecanicos }: Propiedades) {
  const [metrica, setMetrica] = useState<'facturado' | 'ordenes'>('facturado');
  const { estiloTooltip, colorCuadricula, colorTextoAltoContraste } = useColoresGrafica();
  const { t, idioma } = useI18nStore();

  const datos = useMemo<MecanicoRendimiento[]>(() => {
    return topMecanicos
      .map((item) => {
        const facturado = Number(item.facturado) || 0;
        const ordenes = Number(item.ordenes) || 0;
        const promedioOrden = ordenes > 0 ? Math.round(facturado / ordenes) : 0;
        return {
          mecanicoId: item.mecanicoId,
          mecanico: item.mecanico || (idioma === 'en' ? 'Unassigned' : 'Sin asignar'),
          ordenes,
          facturado,
          promedioOrden,
        };
      })
      .sort((a, b) =>
        metrica === 'facturado' ? b.facturado - a.facturado : b.ordenes - a.ordenes,
      );
  }, [topMecanicos, metrica, idioma]);

  const lider = datos[0];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card to-surface p-5.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30 shadow-[0_0_14px_rgba(167,139,250,0.2)]">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                {t('rep.rendimientoMecanicos')}
              </h3>
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                {t('rep.productividad')}
              </span>
            </div>
            <p className="text-xs text-muted">
              {t('rep.rendimientoDescripcion')}
            </p>
          </div>
        </div>

        {/* Toggle métrica */}
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-card p-1">
          <button
            type="button"
            onClick={() => setMetrica('facturado')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              metrica === 'facturado'
                ? 'bg-primary text-black shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            {t('rep.facturacion')}
          </button>
          <button
            type="button"
            onClick={() => setMetrica('ordenes')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              metrica === 'ordenes'
                ? 'bg-primary text-black shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Hammer className="h-3.5 w-3.5" />
            {t('rep.ordenesTotales')}
          </button>
        </div>
      </div>

      {datos.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          {t('rep.sinTecnicos')}
        </div>
      ) : (
        <>
          {/* Ficha del Líder del Taller */}
          {lider && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    {t('rep.tecnicoProductivo')}
                  </p>
                  <p className="text-sm font-extrabold text-foreground">{lider.mecanico}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted">{t('rep.facturacion')}: </span>
                  <span className="font-bold text-amber-400">{formatMoney(lider.facturado)}</span>
                </div>
                <div>
                  <span className="text-muted">{t('rep.colOrdenes')}: </span>
                  <span className="font-bold text-foreground">{formatNumber(lider.ordenes)}</span>
                </div>
                <div>
                  <span className="text-muted">{t('rep.ticketPromedio')}: </span>
                  <span className="font-bold text-emerald-400">{formatMoney(lider.promedioOrden)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfica Recharts */}
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos}
                layout="vertical"
                margin={{ top: 8, right: 18, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke={colorCuadricula} strokeDasharray="4 6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#98A2B3', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val: number) =>
                    metrica === 'facturado'
                      ? val >= 1000
                        ? `$${Math.round(val / 1000)}k`
                        : `$${val}`
                      : String(val)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="mecanico"
                  tick={{ fill: colorTextoAltoContraste, fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={estiloTooltip}
                  formatter={(val) => [
                    metrica === 'facturado' ? formatMoney(Number(val)) : `${val} órdenes`,
                    metrica === 'facturado' ? t('rep.facturadoTotal') : t('rep.ordenesCompletadas'),
                  ]}
                />
                <Bar
                  dataKey={metrica}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={22}
                >
                  {datos.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORES_RANKING[index % COLORES_RANKING.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de técnicos con desglose */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {datos.slice(0, 3).map((item, idx) => (
              <div
                key={item.mecanicoId}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-card p-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-black"
                    style={{ backgroundColor: COLORES_RANKING[idx] }}
                  >
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-foreground truncate max-w-[110px]">
                    {item.mecanico}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{formatMoney(item.facturado)}</p>
                  <p className="text-[10px] text-muted">{item.ordenes} ord. • {formatMoney(item.promedioOrden)}/ord</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
