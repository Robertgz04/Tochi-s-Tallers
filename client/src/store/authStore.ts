import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '@/types';

interface EstadoAuth {
  token: string | null;
  usuario: Usuario | null;
  establecerSesion: (token: string, usuario: Usuario) => void;
  establecerUsuario: (usuario: Usuario) => void;
  cerrarSesion: () => void;
}

export const useAuthStore = create<EstadoAuth>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      establecerSesion: (token, usuario) => set({ token, usuario }),
      establecerUsuario: (usuario) => set({ usuario }),
      cerrarSesion: () => set({ token: null, usuario: null }),
    }),
    { name: 'tochistaller-auth' },
  ),
);
