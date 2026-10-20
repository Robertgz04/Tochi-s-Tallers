import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tema = 'dark' | 'light';

interface EstadoTema {
  tema: Tema;
  alternarTema: () => void;
  establecerTema: (nuevoTema: Tema) => void;
}

function aplicarClaseTema(tema: Tema) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (tema === 'light') {
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }
}

// Aplicar al importar inmediatamente para evitar parpadeos
if (typeof window !== 'undefined') {
  try {
    const guardado = localStorage.getItem('tochistaller-theme');
    if (guardado) {
      const parsed = JSON.parse(guardado);
      if (parsed?.state?.tema) {
        aplicarClaseTema(parsed.state.tema);
      }
    }
  } catch {
    // fallback
  }
}

export const useThemeStore = create<EstadoTema>()(
  persist(
    (set, get) => ({
      tema: 'dark',
      alternarTema: () => {
        const siguiente = get().tema === 'dark' ? 'light' : 'dark';
        aplicarClaseTema(siguiente);
        set({ tema: siguiente });
      },
      establecerTema: (nuevoTema: Tema) => {
        aplicarClaseTema(nuevoTema);
        set({ tema: nuevoTema });
      },
    }),
    {
      name: 'tochistaller-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.tema) {
          aplicarClaseTema(state.tema);
        }
      },
    },
  ),
);

