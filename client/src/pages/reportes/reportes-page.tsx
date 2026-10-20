import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  BarChart3,
  Car,
  ClipboardList,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  UsersRound,
  Wallet,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { useReporteQuery } from '@/hooks/useQueries';
import { useI18nStore } from '@/store/i18nStore';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { GraficaIngresos, type PuntoGrafica } from '@/pages/dashboard/grafica-ingresos';
import { GraficaEstados } from '@/pages/dashboard/grafica-estados';
import { GraficaFacturacionCobro } from './grafica-facturacion-cobro';
import { GraficaRendimientoMecanicos } from './grafica-rendimiento-mecanicos';
import { GraficaMetodosPago } from './grafica-metodos-pago';
import { ModalImportarReportes } from './modal-importar-reportes';
import { formatMoney, formatNumber } from '@/lib/utils';
import { mensajeError } from '@/lib/api';
import { ETIQUETAS_ESTADOS, type EstadoOrden, type ResumenReportes } from '@/types';

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
  const { t } = useI18nStore();
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [menuExportarAbierto, setMenuExportarAbierto] = useState(false);

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

  const handleExportarCSV = () => {
    if (!data) return;
    const fechaHoy = new Date().toISOString().slice(0, 10);
    let csv = `REPORTE FINANCIERO Y OPERATIVO - TOCHI'S TALLER\nFecha de extraccion: ${fechaHoy}\n\n`;

    csv += `RESUMEN GENERAL\n`;
    csv += `Total Facturado,${data.totales.facturado}\n`;
    csv += `Total Cobrado,${data.totales.cobrado}\n`;
    csv += `Por Cobrar,${data.totales.porCobrar}\n`;
    csv += `Ingresos del Mes,${data.totales.ingresosMes}\n`;
    csv += `Clientes Totales,${data.totales.clientes}\n`;
    csv += `Vehiculos Registrados,${data.totales.vehiculos}\n`;
    csv += `Ordenes Totales,${data.totales.ordenes}\n`;
    csv += `Ordenes Entregadas,${data.totales.ordenesEntregadas}\n\n`;

    csv += `INGRESOS MENSUALES\nMes,Total Cobrado\n`;
    data.ingresosMensuales.forEach((m) => {
      csv += `"${m.mes}",${m.total}\n`;
    });
    csv += `\n`;

    csv += `METODOS DE PAGO\nMetodo,Monto,Transacciones\n`;
    data.ingresosPorMetodo.forEach((m) => {
      csv += `"${m.metodo}",${m.monto},${m.cantidad}\n`;
    });
    csv += `\n`;

    csv += `TOP CLIENTES POR FACTURACION\nCliente,Ordenes,Facturado,Pagado,Saldo\n`;
    data.topClientes.forEach((c) => {
      csv += `"${c.cliente.replace(/"/g, '""')}",${c.ordenes},${c.facturado},${c.pagado},${c.saldo}\n`;
    });
    csv += `\n`;

    csv += `PRODUCTIVIDAD POR RESPONSABLE / MECANICO\nMecanico,Ordenes,Facturado\n`;
    data.topMecanicos.forEach((m) => {
      csv += `"${m.mecanico.replace(/"/g, '""')}",${m.ordenes},${m.facturado}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_TochisTaller_${fechaHoy}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMenuExportarAbierto(false);
    toast.success('Reporte CSV extraído exitosamente');
  };

  const handleExportarJSON = () => {
    if (!data) return;
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const jsonStr = JSON.stringify(
      {
        taller: "Tochi's Taller",
        fechaGeneracion: new Date().toISOString(),
        metricas: data,
      },
      null,
      2,
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Completo_TochisTaller_${fechaHoy}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMenuExportarAbierto(false);
    toast.success('Archivo de datos JSON extraído correctamente');
  };

  const handleImprimir = () => {
    setMenuExportarAbierto(false);
    toast.info('Preparando vista de impresión del informe...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (isPending) {
    return (
      <div className="animate-fade-in space-y-5">
        <PageHeader titulo={t('rep.titulo')} descripcion={t('rep.subtitulo')} />
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

  return (
    <div className="animate-fade-in space-y-6">
      {/* Encabezado con Botones de Extraer e Importar Datos */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          titulo={t('rep.titulo')}
          descripcion={t('rep.subtitulo')}
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón Importar */}
          <Button
            variant="secondary"
            onClick={() => setModalImportarAbierto(true)}
            className="flex items-center gap-2 border-white/10 bg-[#161b24] hover:border-white/20 hover:bg-[#1a212d]"
          >
            <ArrowDownToLine className="h-4 w-4 text-sky-400" />
            <span>{t('rep.importar')}</span>
          </Button>

          {/* Menú Extraer / Exportar */}
          <div className="relative">
            <Button
              variant="primary"
              onClick={() => setMenuExportarAbierto((prev) => !prev)}
              className="flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              <ArrowUpFromLine className="h-4 w-4" />
              <span>{t('rep.extraer')}</span>
            </Button>

            {menuExportarAbierto && (
              <div
                className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#141922] p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-scale-in"
                onMouseLeave={() => setMenuExportarAbierto(false)}
              >
                <button
                  type="button"
                  onClick={handleExportarCSV}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-white/[0.08]"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="font-bold">{t('rep.exportarCSV')}</p>
                    <p className="text-[10px] text-muted">Hojas de cálculo y métricas</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleExportarJSON}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-white/[0.08]"
                >
                  <Download className="h-4 w-4 text-sky-400" />
                  <div>
                    <p className="font-bold">{t('rep.exportarJSON')}</p>
                    <p className="text-[10px] text-muted">Estructura completa de datos</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleImprimir}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-white/[0.08]"
                >
                  <Printer className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="font-bold">{t('rep.imprimir')}</p>
                    <p className="text-[10px] text-muted">Formato ejecutivo para gerencia</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportesContenido data={data} ingresos={ingresos} estados={estados} />

      {/* Modal interactivo de importación */}
      <ModalImportarReportes
        abierto={modalImportarAbierto}
        onCerrar={() => setModalImportarAbierto(false)}
        onImportarExito={() => refetch()}
      />
    </div>
  );
}

function ReportesContenido({
  data,
  ingresos,
  estados,
}: {
  data: ResumenReportes;
  ingresos: PuntoGrafica[];
  estados: PuntoGrafica[];
}) {
  const { totales, cotizaciones, topClientes, topMecanicos, ingresosPorMetodo, ordenesPorMes } = data;
  const { t } = useI18nStore();

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
    <div className="space-y-6">
      {/* 1. Finanzas - Tarjetas Principales */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <DollarSign className="h-4 w-4 text-primary" aria-hidden="true" /> {t('rep.finanzas')}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard titulo={t('rep.ingresosMes')} valor={formatMoney(totales.ingresosMes)} icono={DollarSign} detalle="Cobrado este mes" destacado />
          <StatCard titulo={t('rep.facturado')} valor={formatMoney(totales.facturado)} icono={Banknote} detalle="Órdenes no canceladas" />
          <StatCard titulo={t('rep.cobrado')} valor={formatMoney(totales.cobrado)} icono={Wallet} detalle="Pagos registrados" />
          <StatCard titulo={t('rep.porCobrar')} valor={formatMoney(totales.porCobrar)} icono={Wallet} detalle="Saldo pendiente" />
        </div>
      </div>

      {/* NUEVA GRÁFICA 1: Facturación vs Cobranza Mensual Comparativa */}
      <GraficaFacturacionCobro
        ordenesPorMes={ordenesPorMes}
        ingresosMensuales={data.ingresosMensuales}
      />

      {/* NUEVA GRÁFICA 2: Rendimiento y Producción por Técnico / Mecánico */}
      <GraficaRendimientoMecanicos topMecanicos={topMecanicos} />

      {/* NUEVA GRÁFICA 3: Distribución Financiera por Método de Pago */}
      <GraficaMetodosPago ingresosPorMetodo={ingresosPorMetodo} />

      {/* Gráficas Originales del Dashboard: Flujo Histórico y Estados */}
      <div className="grid gap-4 lg:grid-cols-5">
        <GraficaIngresos datos={ingresos} />
        <GraficaEstados datos={estados} />
      </div>

      {/* Órdenes por mes histórico */}
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

      {/* Clientes que más facturan */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/15 text-info ring-1 ring-info/30">
            <UsersRound className="h-4 w-4" aria-hidden="true" />
          </span>
          {t('rep.clientesFacturan')}
        </h3>
        <DataTable<FilaCliente>
          columnas={columnasClientes}
          datos={topClientes}
          claveFila={(fila) => fila.clienteId}
          vacioTitulo="Sin clientes con facturación"
          vacioDescripcion="Aún no hay órdenes asociadas a clientes."
        />
      </div>

      {/* Productividad por responsable */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30">
            <Wrench className="h-4 w-4" aria-hidden="true" />
          </span>
          {t('rep.productividadResponsable')}
        </h3>
        <DataTable<FilaMecanico>
          columnas={columnasMecanicos}
          datos={topMecanicos}
          claveFila={(fila) => fila.mecanicoId}
          vacioTitulo="Sin órdenes asignadas"
          vacioDescripcion="Asigna mecánicos a las órdenes para medir productividad."
        />
      </div>

      {/* Embudo de cotizaciones */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          {t('rep.embudoCotizaciones')}
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

      {/* Operación */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Car className="h-4 w-4 text-info" aria-hidden="true" /> {t('rep.resumenOperativo')}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard titulo={t('rep.clientes')} valor={formatNumber(totales.clientes)} icono={UsersRound} detalle="Registrados" />
          <StatCard titulo={t('rep.vehiculos')} valor={formatNumber(totales.vehiculos)} icono={Car} detalle="En el sistema" />
          <StatCard titulo={t('rep.ordenesTotales')} valor={formatNumber(totales.ordenes)} icono={ClipboardList} detalle="Histórico" />
          <StatCard titulo={t('rep.entregadas')} valor={formatNumber(totales.ordenesEntregadas)} icono={Wrench} detalle="Trabajos cerrados" />
        </div>
      </div>
    </div>
  );
}
