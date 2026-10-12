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
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {saludoPorHora()}, {usuario?.nombre ?? 'amigo'} 👋
        </h2>
        <p className="mt-1 text-sm capitalize text-muted">{fechaHoy}</p>
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
