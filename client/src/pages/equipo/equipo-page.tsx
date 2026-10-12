import { useState } from 'react';
import { UserPlus, UsersRound } from 'lucide-react';
import { useActualizarUsuarioMutation, useCrearUsuarioMutation, useUsuariosQuery } from '@/hooks/useQueries';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UsuarioFormModal } from '@/pages/equipo/usuario-form-modal';
import { iniciales, nombreCompleto } from '@/lib/utils';
import { ETIQUETAS_ROLES, type Usuario } from '@/types';

export default function EquipoPage() {
  const { data, isPending, isError, error, refetch } = useUsuariosQuery();
  const crearUsuario = useCrearUsuarioMutation();
  const actualizarUsuario = useActualizarUsuarioMutation();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioPorCambiar, setUsuarioPorCambiar] = useState<Usuario | null>(null);

  const columnas: Columna<Usuario>[] = [
    {
      clave: 'usuario',
      encabezado: 'Usuario',
      render: (usuario) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
            {iniciales(usuario.nombre, usuario.apellidos)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {nombreCompleto(usuario.nombre, usuario.apellidos)}
            </p>
            <p className="truncate text-xs text-muted">{usuario.correo}</p>
          </div>
        </div>
      ),
    },
    {
      clave: 'telefono',
      encabezado: 'Teléfono',
      ocultoEnMovil: true,
      render: (usuario) => <span className="text-muted">{usuario.telefono ?? '—'}</span>,
    },
    {
      clave: 'rol',
      encabezado: 'Rol',
      render: (usuario) => <Badge variant="primary">{ETIQUETAS_ROLES[usuario.rol]}</Badge>,
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      render: (usuario) =>
        usuario.activo ? (
          <Badge variant="success" conPunto>
            Activo
          </Badge>
        ) : (
          <Badge variant="danger" conPunto>
            Inactivo
          </Badge>
        ),
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      clase: 'text-right',
      render: (usuario) => (
        <Button
          variant={usuario.activo ? 'danger' : 'success'}
          size="sm"
          onClick={() => setUsuarioPorCambiar(usuario)}
        >
          {usuario.activo ? 'Desactivar' : 'Activar'}
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Equipo"
        descripcion="Personas con acceso al taller."
        acciones={
          <Button onClick={() => setModalAbierto(true)}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Nuevo usuario
          </Button>
        }
      />

      <DataTable<Usuario>
        columnas={columnas}
        datos={data ?? []}
        claveFila={(usuario) => usuario.id}
        cargando={isPending}
        error={isError ? (error as Error).message : null}
        onReintentar={() => refetch()}
        vacioTitulo="Aún no hay miembros en el equipo"
        vacioDescripcion="Agrega a tu recepcionista o mecánicos para que trabajen en la plataforma."
        vacioAccion={
          <Button onClick={() => setModalAbierto(true)}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Agregar miembro
          </Button>
        }
      />

      <UsuarioFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCrear={(payload) =>
          crearUsuario.mutate(payload, { onSuccess: () => setModalAbierto(false) })
        }
        cargando={crearUsuario.isPending}
      />

      <ConfirmDialog
        abierto={usuarioPorCambiar !== null}
        onCancelar={() => setUsuarioPorCambiar(null)}
        onConfirmar={() => {
          if (!usuarioPorCambiar) return;
          actualizarUsuario.mutate(
            { id: usuarioPorCambiar.id, payload: { activo: !usuarioPorCambiar.activo } },
            { onSuccess: () => setUsuarioPorCambiar(null) },
          );
        }}
        titulo={usuarioPorCambiar?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        descripcion={
          usuarioPorCambiar?.activo
            ? `${nombreCompleto(usuarioPorCambiar.nombre, usuarioPorCambiar.apellidos)} dejará de poder iniciar sesión. Podrás activarlo cuando quieras.`
            : `${usuarioPorCambiar ? nombreCompleto(usuarioPorCambiar.nombre, usuarioPorCambiar.apellidos) : ''} podrá volver a iniciar sesión.`
        }
        textoConfirmar={usuarioPorCambiar?.activo ? 'Desactivar' : 'Activar'}
        peligro={Boolean(usuarioPorCambiar?.activo)}
        cargando={actualizarUsuario.isPending}
      />

      {data && data.length === 0 && !isPending && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          Los datos del equipo se cargan desde la base de datos.
        </p>
      )}
    </div>
  );
}
