import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Banknote, BarChart3, Car, ClipboardList, DollarSign, FileText, UsersRound, Wallet, Wrench } from 'lucide-react';
import { useReporteQuery } from '@/hooks/useQueries';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { GraficaIngresos, type PuntoGrafica } from '@/pages/dashboard/grafica-ingresos';
import { GraficaEstados } from '@/pages/dashboard/grafica-estados';
import { formatMoney, formatNumber } from '@/lib/utils';
import { mensajeError } from '@/lib/api';
import { ETIQUETAS_ESTADOS, ETIQUETAS_METODO_PAGO, type EstadoOrden, type ResumenReportes } from '@/types';

interface FilaCliente {
  clienteId: string;
  cliente: string;
  ordenes: number;
  facturado: number;
  pagado: number;
  saldo: number;
}

interface FilaMecanico {
  mecanicoId: string;
  mecanico: string;
  ordenes: number;
  facturado: number;
}

export default function ReportesPage() {
  const { data, isPending, isError, error, refetch } = useReporteQuery();

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

  if (isPending) {
    return (
      <div className="animate-fade-in space-y-5">
        <PageHeader titulo="Reportes" descripcion="Indicadores financieros y operativos de tu taller." />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        titulo="No pudimos cargar los reportes"
        descripcion={mensajeError(error, 'Revisa tu conexión e inténtalo de nuevo.')}
        onReintentar={() => refetch()}
      />
    );
  }

  return <ReportesContenido data={data} ingresos={ingresos} estados={estados} />;
}

function ReportesContenido({ data, ingresos, estados }: { data: ResumenReportes; ingresos: PuntoGrafica[]; estados: PuntoGrafica[]; }) {
  const { totales, cotizaciones, topClientes, topMecanicos, ingresosPorMetodo, ordenesPorMes } = data;

  const columnasClientes: Columna<FilaCliente>[] = [
    { clave: 'cliente', encabezado: 'Cliente', render: (fila) => <span className="font-medium text-foreground">{fila.cliente}</span> },
    { clave: 'ordenes', encabezado: 'Órdenes', clase: 'text-center', render: (fila) => <Badge variant="info">{formatNumber(fila.ordenes)}</Badge> },
    { clave: 'facturado', encabezado: 'Facturado', clase: 'text-right', ocultoEnMovil: true, render: (fila) => <span className="text-muted">{formatMoney(fila.facturado)}</span> },
    { clave: 'pagado', encabezado: 'Pagado', clase: 'text-right', ocultoEnMovil: true, render: (fila) => <span className="text-muted">{formatMoney(fila.pagado)}</span> },
    { clave: 'saldo', encabezado: 'Saldo', clase: 'text-right', render: (fila) => <span className={fila.saldo > 0 ? 'font-semibold text-warning' : 'font-semibold text-success'}>{formatMoney(fila.saldo)}</span> },
  ];

  const columnasMecanicos: Columna<FilaMecanico>[] = [
    { clave: 'mecanico', encabezado: 'Responsable', render: (fila) => <span className="font-medium text-foreground">{fila.mecanico}</span> },
    { clave: 'ordenes', encabezado: 'Órdenes', clase: 'text-center', render: (fila) => <Badge variant="default">{formatNumber(fila.ordenes)}</Badge> },
    { clave: 'facturado', encabezado: 'Facturado', clase: 'text-right', render: (fila) => <span className="font-semibold">{formatMoney(fila.facturado)}</span> },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader titulo="Reportes" descripcion="Indicadores financieros y operativos de tu taller." />

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <DollarSign className="h-4 w-4 text-primary" aria-hidden="true" /> Finanzas
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard titulo="Ingresos del mes" valor={formatMoney(totales.ingresosMes)} icono={DollarSign} detalle="Cobrado este mes" destacado />
          <StatCard titulo="Total facturado" valor={formatMoney(totales.facturado)} icono={Banknote} detalle="Órdenes no canceladas" />
          <StatCard titulo="Total cobrado" valor={formatMoney(totales.cobrado)} icono={Wallet} detalle="Pagos registrados" />
          <StatCard titulo="Por cobrar" valor={formatMoney(totales.porCobrar)} icono={Wallet} detalle="Saldo pendiente" />
        </div>
      </div>

      {ingresosPorMetodo.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#12161e] p-5.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/15 text-info ring-1 ring-info/30">
              <Banknote className="h-4 w-4" aria-hidden="true" />
            </span>
            Ingresos por método de pago
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {ingresosPorMetodo.map((metodo) => (
              <div key={metodo.metodo} className="rounded-xl border border-white/[0.08] bg-[#11151e] p-4 transition-all hover:border-white/20 hover:-translate-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {ETIQUETAS_METODO_PAGO[metodo.metodo] ?? metodo.metodo}
                </p>
                <p className="mt-1 text-lg font-extrabold tabular-nums text-foreground">{formatMoney(metodo.monto)}</p>
                <p className="text-xs text-muted">{formatNumber(metodo.cantidad)} pago(s)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <GraficaIngresos datos={ingresos} />
        <GraficaEstados datos={estados} />
      </div>

      {ordenesPorMes.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#12161e] p-5.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
          <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </span>
            Órdenes por mes (últimos 6 meses)
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {ordenesPorMes.map((mes) => (
              <div key={mes.mes} className="rounded-xl border border-white/[0.08] bg-[#11151e] p-4 text-center transition-all hover:border-white/20 hover:-translate-y-0.5">
                <p className="text-xs font-semibold capitalize text-muted">
                  {format(parseISO(`${mes.mes}-01`), 'MMM yy', { locale: es })}
                </p>
                <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">{formatNumber(mes.ordenes)}</p>
                <p className="text-[11px] font-medium text-muted">{formatMoney(mes.facturado)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/15 text-info ring-1 ring-info/30">
            <UsersRound className="h-4 w-4" aria-hidden="true" />
          </span>
          Clientes que más facturan
        </h3>
        <DataTable<FilaCliente>
          columnas={columnasClientes}
          datos={topClientes}
          claveFila={(fila) => fila.clienteId}
          vacioTitulo="Sin clientes con facturación"
          vacioDescripcion="Aún no hay órdenes asociadas a clientes."
        />
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30">
            <Wrench className="h-4 w-4" aria-hidden="true" />
          </span>
          Productividad por responsable
        </h3>
        <DataTable<FilaMecanico>
          columnas={columnasMecanicos}
          datos={topMecanicos}
          claveFila={(fila) => fila.mecanicoId}
          vacioTitulo="Sin órdenes asignadas"
          vacioDescripcion="Asigna mecánicos a las órdenes para medir productividad."
        />
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          Embudo de cotizaciones
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-white/[0.08] bg-[#11151e] p-4.5 transition-all hover:border-white/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Enviadas</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">{formatNumber(cotizaciones.enviadas)}</p>
            <p className="text-xs text-muted">{formatMoney(cotizaciones.montoEnviado)}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4.5 transition-all hover:border-emerald-500/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Aprobadas</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-400">{formatNumber(cotizaciones.aprobadas)}</p>
            <p className="text-xs text-emerald-400/70">{formatMoney(cotizaciones.montoAprobado)}</p>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4.5 transition-all hover:border-rose-500/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Rechazadas</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-rose-400">{formatNumber(cotizaciones.rechazadas)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#11151e] p-4.5 transition-all hover:border-white/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">{formatNumber(cotizaciones.total)}</p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4.5 transition-all hover:border-primary/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Tasa de aprobación</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-primary">
              {cotizaciones.total > 0 ? `${Math.round((cotizaciones.aprobadas / cotizaciones.total) * 100)}%` : '—'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Car className="h-4 w-4 text-info" aria-hidden="true" /> Operación
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard titulo="Clientes" valor={formatNumber(totales.clientes)} icono={UsersRound} detalle="Registrados" />
          <StatCard titulo="Vehículos" valor={formatNumber(totales.vehiculos)} icono={Car} detalle="En el sistema" />
          <StatCard titulo="Órdenes totales" valor={formatNumber(totales.ordenes)} icono={ClipboardList} detalle="Histórico" />
          <StatCard titulo="Entregadas" valor={formatNumber(totales.ordenesEntregadas)} icono={Wrench} detalle="Trabajos cerrados" />
        </div>
      </div>
    </div>
  );
}
