import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Trash2, UserPlus, UsersRound } from 'lucide-react';
import {
  useActualizarClienteMutation,
  useClientesQuery,
  useCrearClienteMutation,
  useEliminarClienteMutation,
} from '@/hooks/useQueries';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SearchInput } from '@/components/ui/search-input';
import { ClienteFormModal } from '@/pages/clientes/cliente-form-modal';
import { iniciales, nombreCompleto } from '@/lib/utils';
import type { Cliente, PayloadCrearCliente } from '@/types';

export default function ClientesPage() {
  const [busqueda, setBusqueda] = useState('');
  const { data, isPending, isError, error, refetch } = useClientesQuery();
  const crearCliente = useCrearClienteMutation();
  const actualizarCliente = useActualizarClienteMutation();
  const eliminarCliente = useEliminarClienteMutation();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clientePorEditar, setClientePorEditar] = useState<Cliente | null>(null);
  const [clientePorEliminar, setClientePorEliminar] = useState<Cliente | null>(null);

  const filtrados = useMemo(() => {
    const lista = data ?? [];
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return lista;
    return lista.filter((cliente) =>
      `${cliente.nombre} ${cliente.apellidos} ${cliente.telefono ?? ''} ${cliente.correo ?? ''}`
        .toLowerCase()
        .includes(termino),
    );
  }, [data, busqueda]);

  const abrirNuevo = () => {
    setClientePorEditar(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (cliente: Cliente) => {
    setClientePorEditar(cliente);
    setModalAbierto(true);
  };

  const guardar = (payload: PayloadCrearCliente) => {
    if (clientePorEditar) {
      actualizarCliente.mutate(
        { id: clientePorEditar.id, payload },
        { onSuccess: () => setModalAbierto(false) },
      );
    } else {
      crearCliente.mutate(payload, { onSuccess: () => setModalAbierto(false) });
    }
  };

  const columnas: Columna<Cliente>[] = [
    {
      clave: 'cliente',
      encabezado: 'Cliente',
      render: (cliente) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
            {iniciales(cliente.nombre, cliente.apellidos)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {nombreCompleto(cliente.nombre, cliente.apellidos)}
            </p>
            <p className="truncate text-xs text-muted">{cliente.correo ?? 'Sin correo'}</p>
          </div>
        </div>
      ),
    },
    {
      clave: 'telefono',
      encabezado: 'Teléfono',
      render: (cliente) => <span className="text-muted">{cliente.telefono ?? '—'}</span>,
    },
    {
      clave: 'vehiculos',
      encabezado: 'Vehículos',
      clase: 'text-center',
      render: (cliente) => (
        <Badge variant={cliente.vehiculos > 0 ? 'info' : 'default'}>{cliente.vehiculos}</Badge>
      ),
    },
    {
      clave: 'registro',
      encabezado: 'Registro',
      ocultoEnMovil: true,
      render: (cliente) => (
        <span className="text-muted">
          {format(parseISO(cliente.fechaRegistro), 'd MMM yyyy', { locale: es })}
        </span>
      ),
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      clase: 'text-right',
      render: (cliente) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Editar ${cliente.nombre}`}
            onClick={() => abrirEdicion(cliente)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Eliminar ${cliente.nombre}`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setClientePorEliminar(cliente)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  const cargandoGuardado = crearCliente.isPending || actualizarCliente.isPending;

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Clientes"
        descripcion="Directorio de clientes y sus vehículos registrados."
        acciones={
          <Button onClick={abrirNuevo}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Nuevo cliente
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          onLimpiar={() => setBusqueda('')}
          placeholder="Buscar por nombre, teléfono o correo..."
        />
      </div>

      <DataTable<Cliente>
        columnas={columnas}
        datos={filtrados}
        claveFila={(cliente) => cliente.id}
        cargando={isPending}
        error={isError ? (error as Error).message : null}
        onReintentar={() => refetch()}
        vacioTitulo={busqueda ? 'Sin resultados' : 'Aún no hay clientes'}
        vacioDescripcion={
          busqueda
            ? 'Ningún cliente coincide con tu búsqueda.'
            : 'Registra tu primer cliente para empezar a asociarle vehículos y órdenes.'
        }
        vacioAccion={
          busqueda ? undefined : (
            <Button onClick={abrirNuevo}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Registrar cliente
            </Button>
          )
        }
      />

      {data && data.length > 0 && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          {filtrados.length === data.length
            ? `${data.length} cliente(s) en tu taller`
            : `${filtrados.length} de ${data.length} clientes`}
        </p>
      )}

      <ClienteFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        cargando={cargandoGuardado}
        cliente={clientePorEditar}
      />

      <ConfirmDialog
        abierto={clientePorEliminar !== null}
        onCancelar={() => setClientePorEliminar(null)}
        onConfirmar={() => {
          if (!clientePorEliminar) return;
          eliminarCliente.mutate(clientePorEliminar.id, {
            onSuccess: () => setClientePorEliminar(null),
          });
        }}
        titulo="Eliminar cliente"
        descripcion={`${clientePorEliminar ? nombreCompleto(clientePorEliminar.nombre, clientePorEliminar.apellidos) : ''} será eliminado permanentemente. Si tiene vehículos u órdenes registradas, primero deberás quitarlos.`}
        textoConfirmar="Eliminar"
        peligro
        cargando={eliminarCliente.isPending}
      />
    </div>
  );
}

