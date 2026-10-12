import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mensajeError } from '@/lib/api';
import { dashboardService } from '@/services/dashboard.service';
import { tallerService, type PayloadActualizarTaller } from '@/services/taller.service';
import { usuarioService } from '@/services/usuario.service';
import type { PayloadActualizarUsuario, PayloadCrearUsuario } from '@/types';

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
