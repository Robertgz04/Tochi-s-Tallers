import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useActualizarCitaMutation,
  useCambiarEstadoCitaMutation,
  useCitasQuery,
  useClientesQuery,
  useCrearCitaMutation,
  useEliminarCitaMutation,
  useUsuariosQuery,
} from '@/hooks/useQueries';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { ESTADOS_CITA, ETIQUETAS_CITA, type Cita, type EstadoCita, type PayloadCrearCita } from '@/types';
import { CitaFormModal } from '@/pages/agenda/cita-form-modal';

const COLOR_CITA: Record<EstadoCita, 'default' | 'info' | 'warning' | 'primary' | 'success' | 'danger'> = {
  PROGRAMADA: 'default', CONFIRMADA: 'info', EN_CURSO: 'warning', COMPLETADA: 'success', CANCELADA: 'danger',
};

export default function AgendaPage() {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Cita | null>(null);
  const [porEliminar, setPorEliminar] = useState<Cita | null>(null);

  const filtros = useMemo(() => ({ pagina, q: busqueda.trim() || undefined, estado: estado || undefined }), [busqueda, estado, pagina]);
  const { data, isPending, isError, error, refetch } = useCitasQuery(filtros);
  const { data: clientes = [] } = useClientesQuery();
  const { data: usuarios = [] } = useUsuariosQuery();
  const crear = useCrearCitaMutation();
  const actualizar = useActualizarCitaMutation();
  const cambiarEstado = useCambiarEstadoCitaMutation();
  const eliminar = useEliminarCitaMutation();

  const guardar = (payload: PayloadCrearCita) => {
    if (editando) actualizar.mutate({ id: editando.id, payload }, { onSuccess: () => { setFormAbierto(false); setEditando(null); } });
    else crear.mutate(payload, { onSuccess: () => setFormAbierto(false) });
  };

  const columnas: Columna<Cita>[] = [
    {
      clave: 'titulo',
      encabezado: 'Cita',
      render: (cita) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info ring-1 ring-info/30 shadow-[0_0_12px_rgba(56,189,248,0.15)]">
            <CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{cita.titulo}</p>
            <p className="truncate text-xs text-muted">
              {format(parseISO(cita.fechaInicio), "EEE d MMM · HH:mm", { locale: es })} – {format(parseISO(cita.fechaFin), 'HH:mm', { locale: es })}
            </p>
          </div>
        </div>
      ),
    },
    {
      clave: 'cliente',
      encabezado: 'Cliente / vehículo',
      render: (cita) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{cita.cliente ?? 'Sin cliente'}</p>
          <div className="mt-1">
            {cita.placa ? <span className="plate-badge">{cita.placa}</span> : <span className="text-xs text-muted">—</span>}
          </div>
        </div>
      ),
    },
    {
      clave: 'responsable',
      encabezado: 'Responsable',
      ocultoEnMovil: true,
      render: (cita) => <span className="font-medium text-muted">{cita.responsable ?? 'Sin asignar'}</span>,
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      render: (cita) => <Badge variant={COLOR_CITA[cita.estado]} conPunto>{ETIQUETAS_CITA[cita.estado]}</Badge>,
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      clase: 'text-right',
      render: (cita) => (
        <div className="flex justify-end gap-1.5">
          <Select
            aria-label={`Cambiar estado de ${cita.titulo}`}
            className="h-9 min-w-32 text-xs"
            value={cita.estado}
            disabled={cambiarEstado.isPending}
            onChange={(e) => cambiarEstado.mutate({ id: cita.id, estado: e.target.value as EstadoCita })}
          >
            {ESTADOS_CITA.map((op) => <option key={op} value={op}>{ETIQUETAS_CITA[op]}</option>)}
          </Select>
          <Button variant="ghost" size="sm" aria-label={`Editar ${cita.titulo}`} onClick={() => { setEditando(cita); setFormAbierto(true); }}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" aria-label={`Eliminar ${cita.titulo}`} className="text-destructive hover:bg-destructive/15 hover:text-destructive" onClick={() => setPorEliminar(cita)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader titulo="Agenda" descripcion="Citas y entregas programadas del taller." acciones={<Button onClick={() => { setEditando(null); setFormAbierto(true); }}><Plus className="h-4 w-4" aria-hidden="true" /> Nueva cita</Button>} />
      <div className="mb-5 grid gap-3 rounded-2xl border border-white/[0.08] bg-[#141922]/70 p-3 sm:p-4 shadow-sm backdrop-blur-md lg:grid-cols-[1fr_240px]">
        <SearchInput value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} onLimpiar={() => { setBusqueda(''); setPagina(1); }} placeholder="Buscar cita por título, cliente o placa..." />
        <Select value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1); }}>
          <option value="">Todos los estados</option>
          {ESTADOS_CITA.map((op) => <option key={op} value={op}>{ETIQUETAS_CITA[op]}</option>)}
        </Select>
      </div>
      <DataTable<Cita>
        columnas={columnas}
        datos={data?.items ?? []}
        claveFila={(cita) => cita.id}
        cargando={isPending}
        error={isError ? (error as Error).message : null}
        onReintentar={() => refetch()}
        vacioTitulo={busqueda || estado ? 'Sin citas con esos filtros' : 'Aún no hay citas'}
        vacioDescripcion={busqueda || estado ? 'Ajusta la búsqueda o el estado.' : 'Agenda tu primera cita para organizar la operación.'}
        vacioAccion={busqueda || estado ? undefined : <Button onClick={() => { setEditando(null); setFormAbierto(true); }}><Plus className="h-4 w-4" aria-hidden="true" /> Crear cita</Button>}
        pagina={data?.pagina}
        totalPaginas={data?.totalPaginas}
        onCambioPagina={setPagina}
      />
      <CitaFormModal abierto={formAbierto} onCerrar={() => { setFormAbierto(false); setEditando(null); }} onGuardar={guardar} cargando={crear.isPending || actualizar.isPending} clientes={clientes} usuarios={usuarios} cita={editando} />
      <ConfirmDialog abierto={porEliminar !== null} onCancelar={() => setPorEliminar(null)} onConfirmar={() => { if (!porEliminar) return; eliminar.mutate(porEliminar.id, { onSuccess: () => setPorEliminar(null) }); }} titulo="Eliminar cita" descripcion={`Se eliminará la cita ${porEliminar ? porEliminar.titulo : ''}.`} textoConfirmar="Eliminar" peligro cargando={eliminar.isPending} />
    </div>
  );
}
