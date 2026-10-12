import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mensajeError } from '@/lib/api';
import { citaService } from '@/services/cita.service';
import { clienteService } from '@/services/cliente.service';
import { cotizacionService } from '@/services/cotizacion.service';
import { dashboardService } from '@/services/dashboard.service';
import { inventarioService } from '@/services/inventario.service';
import { ordenService } from '@/services/orden.service';
import { pagoService } from '@/services/pago.service';
import { reporteService } from '@/services/reporte.service';
import { tallerService, type PayloadActualizarTaller } from '@/services/taller.service';
import { usuarioService } from '@/services/usuario.service';
import { vehiculoService } from '@/services/vehiculo.service';
import type {
  EstadoOrden,
  EstadoCotizacion,
  EstadoCita,
  PayloadActualizarCliente,
  PayloadActualizarCotizacion,
  PayloadActualizarOrden,
  PayloadActualizarVehiculo,
  PayloadActualizarItem,
  PayloadActualizarCita,
  PayloadCrearCliente,
  PayloadCrearCotizacion,
  PayloadCrearOrden,
  PayloadCrearPago,
  PayloadCrearVehiculo,
  PayloadCrearItem,
  PayloadCrearCita,
  PayloadMovimiento,
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

/* ============================================================
   Cotizaciones
   ============================================================ */

export interface FiltrosCotizaciones {
  pagina?: number;
  estado?: string;
  q?: string;
}

export function useCotizacionesQuery(filtros: FiltrosCotizaciones = {}) {
  return useQuery({
    queryKey: ['cotizaciones', filtros.pagina ?? 1, filtros.estado ?? '', filtros.q ?? ''],
    queryFn: () => cotizacionService.listar(filtros),
    staleTime: 15 * 1000,
    retry: 1,
  });
}

export function useEstadosCotizacionQuery() {
  return useQuery({
    queryKey: ['cotizaciones', 'estados'],
    queryFn: cotizacionService.estados,
    staleTime: 15 * 1000,
    retry: 1,
  });
}

function refrescarCotizaciones(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCrearCotizacionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadCrearCotizacion) => cotizacionService.crear(payload),
    onSuccess: (cotizacion) => {
      refrescarCotizaciones(queryClient);
      toast.success(`Cotización ${cotizacion.folio} creada.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos crear la cotización.')),
  });
}

export function useActualizarCotizacionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayloadActualizarCotizacion }) =>
      cotizacionService.actualizar(id, payload),
    onSuccess: (cotizacion) => {
      refrescarCotizaciones(queryClient);
      toast.success(`Cotización ${cotizacion.folio} actualizada.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos actualizar la cotización.')),
  });
}

export function useCambiarEstadoCotizacionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoCotizacion }) =>
      cotizacionService.cambiarEstado(id, estado),
    onSuccess: (cotizacion) => {
      refrescarCotizaciones(queryClient);
      toast.success(`Cotización ${cotizacion.folio}: estado actualizado.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos cambiar el estado.')),
  });
}

/* ============================================================
   Pagos
   ============================================================ */

export interface FiltrosPagos {
  pagina?: number;
  q?: string;
}

export function usePagosQuery(filtros: FiltrosPagos = {}) {
  return useQuery({
    queryKey: ['pagos', filtros.pagina ?? 1, filtros.q ?? ''],
    queryFn: () => pagoService.listar(filtros),
    staleTime: 15 * 1000,
    retry: 1,
  });
}

function refrescarPagos(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['pagos'] });
  queryClient.invalidateQueries({ queryKey: ['ordenes'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCrearPagoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadCrearPago) => pagoService.crear(payload),
    onSuccess: (pago) => {
      refrescarPagos(queryClient);
      toast.success(`Pago registrado en ${pago.ordenFolio}.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos registrar el pago.')),
  });
}

export function useEliminarPagoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagoService.eliminar(id),
    onSuccess: () => {
      refrescarPagos(queryClient);
      toast.success('Pago eliminado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos eliminar el pago.')),
  });
}

/* ============================================================
   Reportes
   ============================================================ */

export function useReporteQuery() {
  return useQuery({
    queryKey: ['reportes', 'resumen'],
    queryFn: reporteService.resumen,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

/* ============================================================
   Inventario
   ============================================================ */

export interface FiltrosInventario {
  pagina?: number;
  q?: string;
  categoria?: string;
  stockBajo?: boolean;
}

export function useInventarioQuery(filtros: FiltrosInventario = {}) {
  return useQuery({
    queryKey: ['inventario', filtros.pagina ?? 1, filtros.q ?? '', filtros.categoria ?? '', filtros.stockBajo ?? false],
    queryFn: () => inventarioService.listar(filtros),
    staleTime: 15 * 1000,
    retry: 1,
  });
}

export function useCrearItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadCrearItem) => inventarioService.crear(payload),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success(`${item.nombre} agregado al inventario.`);
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos crear el producto.')),
  });
}

export function useActualizarItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayloadActualizarItem }) =>
      inventarioService.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Producto actualizado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos actualizar el producto.')),
  });
}

export function useEliminarItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventarioService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Producto eliminado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos eliminar el producto.')),
  });
}

export function useMovimientoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadMovimiento) => inventarioService.movimiento(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Movimiento registrado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos registrar el movimiento.')),
  });
}

/* ============================================================
   Agenda (citas)
   ============================================================ */

export interface FiltrosCitas {
  pagina?: number;
  q?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}

export function useCitasQuery(filtros: FiltrosCitas = {}) {
  return useQuery({
    queryKey: ['citas', filtros.pagina ?? 1, filtros.q ?? '', filtros.estado ?? '', filtros.desde ?? '', filtros.hasta ?? ''],
    queryFn: () => citaService.listar(filtros),
    staleTime: 15 * 1000,
    retry: 1,
  });
}

export function useCrearCitaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayloadCrearCita) => citaService.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      toast.success('Cita creada correctamente.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos crear la cita.')),
  });
}

export function useActualizarCitaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayloadActualizarCita }) =>
      citaService.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      toast.success('Cita actualizada.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos actualizar la cita.')),
  });
}

export function useCambiarEstadoCitaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoCita }) => citaService.cambiarEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      toast.success('Estado de la cita actualizado.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos cambiar el estado.')),
  });
}

export function useEliminarCitaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => citaService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      toast.success('Cita eliminada.');
    },
    onError: (error) => toast.error(mensajeError(error, 'No pudimos eliminar la cita.')),
  });
}


