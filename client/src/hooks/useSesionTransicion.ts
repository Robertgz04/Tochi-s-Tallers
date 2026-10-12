import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { SEGUNDOS_REDIRECCION, useSesionTransicionStore } from '@/store/sesionTransicionStore';

/**
 * Acciones de sesión con pantalla de bienvenida/despedida y redirección en 3 segundos.
 *
 * - `despedir` muestra la pantalla de cierre y, al terminar, limpia la sesión,
 *   vacía la caché de React Query y regresa al inicio de sesión.
 * - `bienvenida` (usada por login y registro) muestra la pantalla de bienvenida
 *   y navega a `destino` al terminar.
 */
export function useSesionTransicion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mostrar = useSesionTransicionStore((estado) => estado.mostrar);

  /** Cierra la sesión con pantalla de despedida → redirige a `/login`. */
  const despedir = useCallback(() => {
    const { usuario, cerrarSesion } = useAuthStore.getState();

    mostrar({
      tipo: 'DESPEDIDA',
      nombre: usuario?.nombre ?? '',
      apellidos: usuario?.apellidos ?? '',
      segundos: SEGUNDOS_REDIRECCION,
      alTerminar: () => {
        queryClient.clear();
        cerrarSesion();
        navigate('/login', { replace: true });
      },
    });
  }, [mostrar, navigate, queryClient]);

  /** Muestra la bienvenida y, al terminar, ejecuta `alIniciar` y navega a `destino`. */
  const bienvenida = useCallback(
    (
      usuario: { nombre: string; apellidos: string },
      opciones?: { destino?: string; alIniciar?: () => void },
    ) => {
      mostrar({
        tipo: 'BIENVENIDA',
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        segundos: SEGUNDOS_REDIRECCION,
        alTerminar: () => {
          opciones?.alIniciar?.();
          navigate(opciones?.destino ?? '/dashboard', { replace: true });
        },
      });
    },
    [mostrar, navigate],
  );

  return { despedir, bienvenida };
}