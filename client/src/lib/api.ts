import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import {
  SEGUNDOS_REDIRECCION,
  useSesionTransicionStore,
} from '@/store/sesionTransicionStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { token, usuario, cerrarSesion } = useAuthStore.getState();
      if (token) {
        // Sesión expirada: se avisa al usuario antes de volver al inicio de sesión.
        useSesionTransicionStore.getState().mostrar({
          tipo: 'DESPEDIDA',
          nombre: usuario?.nombre ?? '',
          apellidos: usuario?.apellidos ?? '',
          segundos: SEGUNDOS_REDIRECCION,
          alTerminar: () => {
            cerrarSesion();
            if (window.location.pathname !== '/login') {
              window.location.assign('/login');
            }
          },
        });
      }
    }
    return Promise.reject(error);
  },
);

/** Traduce cualquier error a un mensaje amigable para el usuario. */
export function mensajeError(
  error: unknown,
  mensajePorDefecto = 'Ocurrió un error inesperado. Inténtalo nuevamente.',
): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const datos = error.response.data as { message?: string } | undefined;
      return datos?.message ?? mensajePorDefecto;
    }
    if (error.code === 'ECONNABORTED') {
      return 'La petición tardó demasiado. Revisa tu conexión e inténtalo de nuevo.';
    }
    return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  return mensajePorDefecto;
}
