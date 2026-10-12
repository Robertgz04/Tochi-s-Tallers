import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mensajeError } from '@/lib/api';
import { clienteService } from '@/services/cliente.service';
import { dashboardService } from '@/services/dashboard.service';
import { ordenService } from '@/services/orden.service';
import { tallerService, type PayloadActualizarTaller } from '@/services/taller.service';
import { usuarioService } from '@/services/usuario.service';
import { vehiculoService } from '@/services/vehiculo.service';
import type {
  EstadoOrden,
  PayloadActualizarCliente,
  PayloadActualizarOrden,
  PayloadActualizarVehiculo,
  PayloadCrearCliente,
  PayloadCrearOrden,
  PayloadCrearVehiculo,
  PayloadActualizarUsuario,
  PayloadCrearUsuario,
} from '@/types';

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.obtener,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useMiTallerQuery() {
  return useQuery({
    queryKey: ['taller'],
    queryFn: tallerService.obtenerMiTaller,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useActualizarTallerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadActualizarTaller) => tallerService.actualizarMiTaller(payload),
    onSuccess: (taller) => {
      queryClient.setQueryData(['taller'], taller);
      toast.success('Taller actualizado correctamente.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos guardar los cambios.')),
  });
}

export function useUsuariosQuery() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: usuarioService.listar,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useCrearUsuarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadCrearUsuario) => usuarioService.crear(payload),
    onSuccess: (usuario) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success(`${usuario.nombre} ${usuario.apellidos} fue agregado al equipo.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos crear el usuario.')),
  });
}

/* ============================================================
   Clientes
   ============================================================ */

export function useClientesQuery(busqueda?: string) {
  return useQuery({
    queryKey: ['clientes', busqueda ?? ''],
    queryFn: () => clienteService.listar(busqueda),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useCrearClienteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadCrearCliente) => clienteService.crear(payload),
    onSuccess: (cliente) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success(`${cliente.nombre} ${cliente.apellidos} fue registrado.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos crear el cliente.')),
  });
}

export function useActualizarClienteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayloadActualizarCliente }) =>
      clienteService.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente actualizado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos actualizar el cliente.')),
  });
}

export function useEliminarClienteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clienteService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Cliente eliminado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos eliminar el cliente.')),
  });
}

export function useActualizarUsuarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayloadActualizarUsuario }) =>
      usuarioService.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario actualizado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos actualizar el usuario.')),
  });
}

/* ============================================================
   Vehículos
   ============================================================ */

export function useVehiculosQuery(params: { q?: string; clienteId?: string } = {}) {
  return useQuery({
    queryKey: ['vehiculos', params.q ?? '', params.clienteId ?? ''],
    queryFn: () => vehiculoService.listar(params),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useCrearVehiculoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadCrearVehiculo) => vehiculoService.crear(payload),
    onSuccess: (vehiculo) => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success(`${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa}) fue registrado.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos crear el vehículo.')),
  });
}

export function useActualizarVehiculoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayloadActualizarVehiculo }) =>
      vehiculoService.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo actualizado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos actualizar el vehículo.')),
  });
}

export function useEliminarVehiculoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiculoService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Vehículo eliminado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos eliminar el vehículo.')),
  });
}

/* ============================================================
   Órdenes de trabajo
   ============================================================ */

export interface FiltrosOrdenes {
  pagina?: number;
  estado?: string;
  q?: string;
}

export function useOrdenesQuery(filtros: FiltrosOrdenes = {}) {
  return useQuery({
    queryKey: ['ordenes', filtros.pagina ?? 1, filtros.estado ?? '', filtros.q ?? ''],
    queryFn: () => ordenService.listar(filtros),
    staleTime: 15 * 1000,
    retry: 1,
  });
}

export function useEstadosOrdenQuery() {
  return useQuery({
    queryKey: ['ordenes', 'estados'],
    queryFn: ordenService.estados,
    staleTime: 15 * 1000,
    retry: 1,
  });
}

export function useOrdenQuery(id: string | null) {
  return useQuery({
    queryKey: ['ordenes', 'detalle', id],
    queryFn: () => ordenService.obtener(id as string),
    enabled: Boolean(id),
    retry: 1,
  });
}

/** Refresca listados de órdenes y el dashboard tras cualquier cambio. */
function refrescarOrdenes(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['ordenes'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCrearOrdenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadCrearOrden) => ordenService.crear(payload),
    onSuccess: (orden) => {
      refrescarOrdenes(queryClient);
      toast.success(`Orden ${orden.folio} creada correctamente.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos crear la orden.')),
  });
}

export function useActualizarOrdenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayloadActualizarOrden }) =>
      ordenService.actualizar(id, payload),
    onSuccess: (orden) => {
      refrescarOrdenes(queryClient);
      toast.success(`Orden ${orden.folio} actualizada.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos actualizar la orden.')),
  });
}

export function useCambiarEstadoOrdenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoOrden }) =>
      ordenService.cambiarEstado(id, estado),
    onSuccess: (orden) => {
      refrescarOrdenes(queryClient);
      toast.success(`Orden ${orden.folio}: estado actualizado.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos cambiar el estado.')),
  });
}


