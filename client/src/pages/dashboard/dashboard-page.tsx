import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, ClipboardList, DollarSign, FileClock, Wallet } from 'lucide-react';
import { useDashboardQuery } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/authStore';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { StatCard } from '@/components/ui/stat-card';
import { mensajeError } from '@/lib/api';
import { formatMoney, saludoPorHora } from '@/lib/utils';
import { ETIQUETAS_ESTADOS, type EstadoOrden } from '@/types';
import { GraficaIngresos, type PuntoGrafica } from '@/pages/dashboard/grafica-ingresos';
import { GraficaEstados } from '@/pages/dashboard/grafica-estados';
import { TrabajosRecientes } from '@/pages/dashboard/trabajos-recientes';

export default function DashboardPage() {
  const usuario = useAuthStore((estado) => estado.usuario);
  const { data, isPending, isError, error, refetch } = useDashboardQuery();

  const ingresos = useMemo<PuntoGrafica[]>(() => {
    if (!data) return [];
    return data.ingresosMensuales.map((punto) => ({
      nombre: format(parseISO(`${punto.mes}-01`), "MMM ''yy", { locale: es }),
      valor: punto.total,
    }));
  }, [data]);

  const estados = useMemo<PuntoGrafica[]>(() => {
    if (!data) return [];
    return data.ordenesPorEstado.map((punto) => ({
      nombre: ETIQUETAS_ESTADOS[punto.estado as EstadoOrden] ?? punto.estado,
      valor: punto.cantidad,
    }));
  }, [data]);

  const fechaHoy = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });

  if (isPending) return <DashboardSkeleton />;

  if (isError) {
    return (
      <ErrorState
        titulo="No pudimos cargar el resumen de tu taller"
        descripcion={mensajeError(error, 'Revisa tu conexión e inténtalo de nuevo.')}
        onReintentar={() => refetch()}
      />
    );
  }

  const { stats, trabajosRecientes } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-card via-card to-surface p-5 sm:p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Panel Operativo
              </span>
              <p className="text-xs font-semibold capitalize text-muted">{fechaHoy}</p>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {saludoPorHora()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-amber-200">{usuario?.nombre ?? 'amigo'}</span> 👋
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Aquí tienes el estado operativo en tiempo real de tu taller automotriz.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatCard
          titulo="Órdenes activas"
          valor={String(stats.ordenesActivas)}
          icono={ClipboardList}
          detalle="En proceso de atención"
        />
        <StatCard
          titulo="Vehículos listos"
          valor={String(stats.vehiculosListos)}
          icono={CheckCircle2}
          detalle="Pendientes de entrega"
        />
        <StatCard
          titulo="Cotizaciones"
          valor={String(stats.cotizacionesPendientes)}
          icono={FileClock}
          detalle="Esperando respuesta"
        />
        <StatCard
          titulo="Pagos pendientes"
          valor={formatMoney(stats.pagosPendientes)}
          icono={Wallet}
          detalle="Por cobrar"
        />
        <StatCard
          titulo="Ingresos del mes"
          valor={formatMoney(stats.ingresosMes)}
          icono={DollarSign}
          detalle="Cobrado este mes"
          destacado
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <GraficaIngresos datos={ingresos} />
        <GraficaEstados datos={estados} />
      </div>

      <TrabajosRecientes trabajos={trabajosRecientes} />
    </div>
  );
}
