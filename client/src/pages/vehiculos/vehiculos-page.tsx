import { useMemo, useState } from 'react';
import { Car, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useActualizarVehiculoMutation,
  useClientesQuery,
  useCrearVehiculoMutation,
  useEliminarVehiculoMutation,
  useVehiculosQuery,
} from '@/hooks/useQueries';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SearchInput } from '@/components/ui/search-input';
import { VehiculoFormModal } from '@/pages/vehiculos/vehiculo-form-modal';
import { formatNumber } from '@/lib/utils';
import {
  ETIQUETAS_COMBUSTIBLE,
  type Combustible,
  type PayloadCrearVehiculo,
  type Vehiculo,
} from '@/types';

export default function VehiculosPage() {
  const [busqueda, setBusqueda] = useState('');
  const { data, isPending, isError, error, refetch } = useVehiculosQuery();
  const { data: clientes = [] } = useClientesQuery();
  const crearVehiculo = useCrearVehiculoMutation();
  const actualizarVehiculo = useActualizarVehiculoMutation();
  const eliminarVehiculo = useEliminarVehiculoMutation();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [vehiculoPorEditar, setVehiculoPorEditar] = useState<Vehiculo | null>(null);
  const [vehiculoPorEliminar, setVehiculoPorEliminar] = useState<Vehiculo | null>(null);

  const filtrados = useMemo(() => {
    const lista = data ?? [];
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return lista;
    return lista.filter((vehiculo) =>
      `${vehiculo.placa} ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.clienteNombre} ${vehiculo.vin ?? ''}`
        .toLowerCase()
        .includes(termino),
    );
  }, [data, busqueda]);

  const abrirNuevo = () => {
    setVehiculoPorEditar(null);
    setModalAbierto(true);
  };

  const guardar = (payload: PayloadCrearVehiculo) => {
    if (vehiculoPorEditar) {
      const { clienteId: _omitido, ...campos } = payload;
      void _omitido;
      actualizarVehiculo.mutate(
        { id: vehiculoPorEditar.id, payload: campos },
        { onSuccess: () => setModalAbierto(false) },
      );
    } else {
      crearVehiculo.mutate(payload, { onSuccess: () => setModalAbierto(false) });
    }
  };

  const columnas: Columna<Vehiculo>[] = [
    {
      clave: 'vehiculo',
      encabezado: 'Vehículo',
      render: (vehiculo) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info ring-1 ring-info/30 shadow-[0_0_12px_rgba(56,189,248,0.15)]">
            <Car className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {vehiculo.marca} {vehiculo.modelo}
              {vehiculo.anio ? ` · ${vehiculo.anio}` : ''}
            </p>
            <div className="mt-1">
              <span className="plate-badge">{vehiculo.placa}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      clave: 'dueno',
      encabezado: 'Propietario',
      render: (vehiculo) => <span className="font-medium text-foreground">{vehiculo.clienteNombre}</span>,
    },
    {
      clave: 'km',
      encabezado: 'Kilometraje',
      ocultoEnMovil: true,
      render: (vehiculo) => (
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">{formatNumber(vehiculo.kilometraje)} km</span>
      ),
    },
    {
      clave: 'combustible',
      encabezado: 'Combustible',
      ocultoEnMovil: true,
      render: (vehiculo) => (
        <Badge variant="default">
          {ETIQUETAS_COMBUSTIBLE[vehiculo.combustible as Combustible] ?? vehiculo.combustible}
        </Badge>
      ),
    },
    {
      clave: 'ordenes',
      encabezado: 'Órdenes',
      clase: 'text-center',
      render: (vehiculo) => (
        <Badge variant={vehiculo.ordenes > 0 ? 'primary' : 'default'} conPunto>{vehiculo.ordenes} ord.</Badge>
      ),
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      clase: 'text-right',
      render: (vehiculo) => (
        <div className="flex justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Editar ${vehiculo.placa}`}
            onClick={() => {
              setVehiculoPorEditar(vehiculo);
              setModalAbierto(true);
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Eliminar ${vehiculo.placa}`}
            className="text-destructive hover:bg-destructive/15 hover:text-destructive"
            onClick={() => setVehiculoPorEliminar(vehiculo)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  const cargandoGuardado = crearVehiculo.isPending || actualizarVehiculo.isPending;

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Vehículos"
        descripcion="Vehículos registrados en el taller y sus propietarios."
        acciones={
          <Button onClick={abrirNuevo}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo vehículo
          </Button>
        }
      />

      <div className="mb-5 rounded-2xl border border-white/[0.08] bg-[#141922]/70 p-3 sm:p-4 shadow-sm backdrop-blur-md">
        <SearchInput
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          onLimpiar={() => setBusqueda('')}
          placeholder="Buscar vehículo por placa, marca, modelo o propietario..."
        />
      </div>

      <DataTable<Vehiculo>
        columnas={columnas}
        datos={filtrados}
        claveFila={(vehiculo) => vehiculo.id}
        cargando={isPending}
        error={isError ? (error as Error).message : null}
        onReintentar={() => refetch()}
        vacioTitulo={busqueda ? 'Sin resultados' : 'Aún no hay vehículos'}
        vacioDescripcion={
          busqueda
            ? 'Ningún vehículo coincide con tu búsqueda.'
            : 'Registra tu primer vehículo para empezar a asociarle órdenes de servicio.'
        }
        vacioAccion={
          busqueda ? undefined : (
            <Button onClick={abrirNuevo}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Registrar vehículo
            </Button>
          )
        }
      />

      {data && data.length > 0 && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <Car className="h-4 w-4" aria-hidden="true" />
          {filtrados.length === data.length
            ? `${data.length} vehículo(s) en tu taller`
            : `${filtrados.length} de ${data.length} vehículos`}
        </p>
      )}

      <VehiculoFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        cargando={cargandoGuardado}
        clientes={clientes}
        vehiculo={vehiculoPorEditar}
      />

      <ConfirmDialog
        abierto={vehiculoPorEliminar !== null}
        onCancelar={() => setVehiculoPorEliminar(null)}
        onConfirmar={() => {
          if (!vehiculoPorEliminar) return;
          eliminarVehiculo.mutate(vehiculoPorEliminar.id, {
            onSuccess: () => setVehiculoPorEliminar(null),
          });
        }}
        titulo="Eliminar vehículo"
        descripcion={`${vehiculoPorEliminar ? `${vehiculoPorEliminar.marca} ${vehiculoPorEliminar.modelo} (${vehiculoPorEliminar.placa})` : ''} será eliminado permanentemente. Si tiene órdenes registradas, primero deberás quitarlas.`}
        textoConfirmar="Eliminar"
        peligro
        cargando={eliminarVehiculo.isPending}
      />
    </div>
  );
}
