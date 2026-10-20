import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClipboardList, Pencil, Plus, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  useActualizarOrdenMutation,
  useCambiarEstadoOrdenMutation,
  useClientesQuery,
  useCrearOrdenMutation,
  useEstadosOrdenQuery,
  useOrdenQuery,
  useOrdenesQuery,
  useUsuariosQuery,
  useVehiculosQuery,
} from '@/hooks/useQueries';
import { formatMoney, formatNumber } from '@/lib/utils';
import { OrdenFormModal } from '@/pages/ordenes/orden-form-modal';
import { ESTADOS_ORDEN, ETIQUETAS_ESTADOS, type EstadoOrden, type OrdenResumen, type PayloadActualizarOrden, type PayloadCrearOrden } from '@/types';

const TODOS = '';

export default function OrdenesPage() {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<string>(TODOS);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ordenEditandoId, setOrdenEditandoId] = useState<string | null>(null);

  const filtros = useMemo(
    () => ({ pagina, estado: estado || undefined, q: busqueda.trim() || undefined }),
    [busqueda, estado, pagina],
  );

  const { data, isPending, isError, error, refetch } = useOrdenesQuery(filtros);
  const { data: conteos = [] } = useEstadosOrdenQuery();
  const { data: clientes = [] } = useClientesQuery();
  const { data: vehiculos = [] } = useVehiculosQuery();
  const { data: usuarios = [] } = useUsuariosQuery();
  const { data: ordenDetalle } = useOrdenQuery(ordenEditandoId);
  const crearOrden = useCrearOrdenMutation();
  const actualizarOrden = useActualizarOrdenMutation();
  const cambiarEstado = useCambiarEstadoOrdenMutation();

  const abrirNueva = () => {
    setOrdenEditandoId(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (orden: OrdenResumen) => {
    setOrdenEditandoId(orden.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setOrdenEditandoId(null);
  };

  const guardar = (payload: PayloadCrearOrden | PayloadActualizarOrden) => {
    if (ordenEditandoId) {
      actualizarOrden.mutate(
        { id: ordenEditandoId, payload: payload as PayloadActualizarOrden },
        { onSuccess: cerrarModal },
      );
      return;
    }
    crearOrden.mutate(payload as PayloadCrearOrden, { onSuccess: cerrarModal });
  };

  const columnas: Columna<OrdenResumen>[] = [
    {
      clave: 'folio',
      encabezado: 'Orden',
      render: (orden) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <ClipboardList className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-foreground">{orden.folio}</p>
            <p className="truncate text-xs text-muted">
              {format(parseISO(orden.fechaIngreso), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
        </div>
      ),
    },
    {
      clave: 'vehiculo',
      encabezado: 'Vehículo / cliente',
      render: (orden) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{orden.vehiculo}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="plate-badge">{orden.placa}</span>
            <span className="truncate text-xs text-muted">{orden.cliente}</span>
          </div>
        </div>
      ),
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      render: (orden) => <StatusBadge estado={orden.estado} />,
    },
    {
      clave: 'mecanico',
      encabezado: 'Responsable',
      ocultoEnMovil: true,
      render: (orden) => <span className="text-muted">{orden.mecanico ?? 'Sin asignar'}</span>,
    },
    {
      clave: 'total',
      encabezado: 'Total',
      clase: 'text-right',
      render: (orden) => <span className="font-extrabold tabular-nums text-foreground">{formatMoney(orden.total)}</span>,
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      clase: 'text-right',
      render: (orden) => (
        <div className="flex justify-end gap-2">
          <Select
            aria-label={`Cambiar estado de ${orden.folio}`}
            className="h-9 min-w-40 text-xs"
            value={orden.estado}
            disabled={cambiarEstado.isPending}
            onChange={(evento) => cambiarEstado.mutate({ id: orden.id, estado: evento.target.value as EstadoOrden })}
          >
            {ESTADOS_ORDEN.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETAS_ESTADOS[opcion]}
              </option>
            ))}
          </Select>
          <Button variant="ghost" size="sm" aria-label={`Editar ${orden.folio}`} onClick={() => abrirEdicion(orden)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  const totalOrdenes = data?.total ?? 0;
  const cargandoGuardado = crearOrden.isPending || actualizarOrden.isPending;
  const modalPuedeMostrarse = !ordenEditandoId || Boolean(ordenDetalle);

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Órdenes de trabajo"
        descripcion="Controla el avance, responsable, importes y estado de cada servicio."
        acciones={
          <Button onClick={abrirNueva}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva orden
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 rounded-2xl border border-white/[0.08] bg-card/70 p-3 sm:p-4 shadow-sm backdrop-blur-md lg:grid-cols-[1fr_260px]">
        <SearchInput
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            setPagina(1);
          }}
          onLimpiar={() => {
            setBusqueda('');
            setPagina(1);
          }}
          placeholder="Buscar por folio, cliente, placa o vehículo..."
        />
        <Select
          value={estado}
          onChange={(evento) => {
            setEstado(evento.target.value);
            setPagina(1);
          }}
        >
          <option value={TODOS}>Todos los estados</option>
          {ESTADOS_ORDEN.map((opcion) => {
            const cantidad = conteos.find((conteo) => conteo.estado === opcion)?.cantidad;
            return (
              <option key={opcion} value={opcion}>
                {ETIQUETAS_ESTADOS[opcion]}{cantidad ? ` (${cantidad})` : ''}
              </option>
            );
          })}
        </Select>
      </div>

      <DataTable<OrdenResumen>
        columnas={columnas}
        datos={data?.items ?? []}
        claveFila={(orden) => orden.id}
        cargando={isPending}
        error={isError ? (error as Error).message : null}
        onReintentar={() => refetch()}
        vacioTitulo={busqueda || estado ? 'Sin órdenes con esos filtros' : 'Aún no hay órdenes'}
        vacioDescripcion={
          busqueda || estado
            ? 'Ajusta la búsqueda o el estado para ver más resultados.'
            : 'Crea la primera orden de trabajo para iniciar el seguimiento operativo.'
        }
        vacioAccion={
          busqueda || estado ? undefined : (
            <Button onClick={abrirNueva}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Crear orden
            </Button>
          )
        }
        pagina={data?.pagina}
        totalPaginas={data?.totalPaginas}
        onCambioPagina={setPagina}
      />

      {totalOrdenes > 0 && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          <Badge variant="default">{formatNumber(totalOrdenes)}</Badge>
          orden(es) registradas
        </p>
      )}

      <OrdenFormModal
        abierto={modalAbierto && modalPuedeMostrarse}
        onCerrar={cerrarModal}
        onGuardar={guardar}
        cargando={cargandoGuardado}
        clientes={clientes}
        vehiculos={vehiculos}
        usuarios={usuarios}
        orden={ordenEditandoId ? (ordenDetalle ?? null) : null}
      />
    </div>
  );
}