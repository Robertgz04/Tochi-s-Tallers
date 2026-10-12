import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

/** Hidrata el usuario a partir del token guardado (arranque de la app). */
export function useMeQuery() {
  const token = useAuthStore((estado) => estado.token);
  const establecerUsuario = useAuthStore((estado) => estado.establecerUsuario);

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const usuario = await authService.obtenerMe();
      establecerUsuario(usuario);
      return usuario;
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
