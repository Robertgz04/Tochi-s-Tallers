import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Link2, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { CotizacionFormModal } from '@/pages/cotizaciones/cotizacion-form-modal';
import {
  useActualizarCotizacionMutation,
  useCambiarEstadoCotizacionMutation,
  useClientesQuery,
  useCotizacionesQuery,
  useCrearCotizacionMutation,
  useEstadosCotizacionQuery,
  useOrdenesQuery,
  useVehiculosQuery,
} from '@/hooks/useQueries';
import { formatMoney } from '@/lib/utils';
import { ESTADOS_COTIZACION, ETIQUETAS_COTIZACION, type CotizacionResumen, type EstadoCotizacion, type PayloadActualizarCotizacion, type PayloadCrearCotizacion } from '@/types';

const COLOR: Record<EstadoCotizacion, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
  BORRADOR: 'default', ENVIADA: 'info', APROBADA: 'success', RECHAZADA: 'danger', VENCIDA: 'warning',
};

export default function CotizacionesPage() {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<CotizacionResumen | null>(null);
  const filtros = useMemo(() => ({ pagina, estado: estado || undefined, q: busqueda.trim() || undefined }), [busqueda, estado, pagina]);
  const { data, isPending, isError, error, refetch } = useCotizacionesQuery(filtros);
  const { data: conteos = [] } = useEstadosCotizacionQuery();
  const { data: clientes = [] } = useClientesQuery();
  const { data: vehiculos = [] } = useVehiculosQuery();
  const { data: ordenesData } = useOrdenesQuery({ pagina: 1 });
  const crear = useCrearCotizacionMutation();
  const actualizar = useActualizarCotizacionMutation();
  const cambiarEstado = useCambiarEstadoCotizacionMutation();

  const guardar = (payload: PayloadCrearCotizacion | PayloadActualizarCotizacion) => {
    if (editando) actualizar.mutate({ id: editando.id, payload: payload as PayloadActualizarCotizacion }, { onSuccess: () => { setModalAbierto(false); setEditando(null); } });
    else crear.mutate(payload as PayloadCrearCotizacion, { onSuccess: () => setModalAbierto(false) });
  };

  const compartir = async (cot: CotizacionResumen) => {
    if (!cot.tokenPublico) {
      toast.error('Esta cotización aún no tiene enlace público.');
      return;
    }
    const enlace = `${window.location.origin}/c/${cot.tokenPublico}`;
    try {
      await navigator.clipboard.writeText(enlace);
      toast.success('Enlace copiado. Pégalo en WhatsApp o SMS para tu cliente.');
    } catch {
      toast.info(`Enlace: ${enlace}`);
    }
  };

  const columnas: Columna<CotizacionResumen>[] = [
    { clave: 'folio', encabezado: 'Cotización', render: (cot) => <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/10 text-info"><FileText className="h-4 w-4" /></span><div><p className="font-semibold">{cot.folio}</p><p className="text-xs text-muted">{format(parseISO(cot.fechaCreacion), 'dd MMM yyyy', { locale: es })}</p></div></div> },
    { clave: 'cliente', encabezado: 'Cliente / vehículo', render: (cot) => <div><p className="font-medium">{cot.cliente}</p><p className="text-xs text-muted">{cot.placa} · {cot.vehiculo}</p></div> },
    { clave: 'estado', encabezado: 'Estado', render: (cot) => <Badge variant={COLOR[cot.estado]} conPunto>{ETIQUETAS_COTIZACION[cot.estado]}</Badge> },
    { clave: 'orden', encabezado: 'Orden', ocultoEnMovil: true, render: (cot) => <span className="text-muted">{cot.ordenFolio ?? '—'}</span> },
    { clave: 'total', encabezado: 'Total', clase: 'text-right', render: (cot) => <span className="font-semibold">{formatMoney(cot.total)}</span> },
    { clave: 'acciones', encabezado: 'Acciones', clase: 'text-right', render: (cot) => <div className="flex justify-end gap-2"><Select className="h-9 min-w-32" value={cot.estado} disabled={cambiarEstado.isPending} onChange={(e) => cambiarEstado.mutate({ id: cot.id, estado: e.target.value as EstadoCotizacion })}>{ESTADOS_COTIZACION.map((op) => <option key={op} value={op}>{ETIQUETAS_COTIZACION[op]}</option>)}</Select><Button variant="ghost" size="sm" aria-label={`Compartir ${cot.folio}`} onClick={() => compartir(cot)}><Link2 className="h-4 w-4" /></Button><Button variant="ghost" size="sm" aria-label={`Editar ${cot.folio}`} onClick={() => { setEditando(cot); setModalAbierto(true); }}><Pencil className="h-4 w-4" /></Button></div> },
  ];

  return <div className="animate-fade-in"><PageHeader titulo="Cotizaciones" descripcion="Presupuestos enviados, aprobados o rechazados por clientes." acciones={<Button onClick={() => { setEditando(null); setModalAbierto(true); }}><Plus className="h-4 w-4" />Nueva cotización</Button>} />
    <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_240px]"><SearchInput value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} onLimpiar={() => { setBusqueda(''); setPagina(1); }} placeholder="Buscar por folio, cliente, placa u orden..." /><Select value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1); }}><option value="">Todos los estados</option>{ESTADOS_COTIZACION.map((op) => <option key={op} value={op}>{ETIQUETAS_COTIZACION[op]}{conteos.find((c) => c.estado === op)?.cantidad ? ` (${conteos.find((c) => c.estado === op)?.cantidad})` : ''}</option>)}</Select></div>
    <DataTable columnas={columnas} datos={data?.items ?? []} claveFila={(cot) => cot.id} cargando={isPending} error={isError ? (error as Error).message : null} onReintentar={() => refetch()} vacioTitulo="Sin cotizaciones" vacioDescripcion="Crea una cotización para documentar importes y aprobación del cliente." pagina={data?.pagina} totalPaginas={data?.totalPaginas} onCambioPagina={setPagina} />
    <CotizacionFormModal abierto={modalAbierto} onCerrar={() => { setModalAbierto(false); setEditando(null); }} onGuardar={guardar} cargando={crear.isPending || actualizar.isPending} clientes={clientes} vehiculos={vehiculos} ordenes={ordenesData?.items ?? []} cotizacion={editando} />
  </div>;
}