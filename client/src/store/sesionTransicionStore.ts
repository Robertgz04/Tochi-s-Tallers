import { create } from 'zustand';

/** Segundos que permanece la pantalla de transición antes de redirigir. */
export const SEGUNDOS_REDIRECCION = 3;

export type TipoTransicion = 'BIENVENIDA' | 'DESPEDIDA';

export interface Transicion {
  tipo: TipoTransicion;
  /** Nombre del usuario al que se saluda (o se despide). */
  nombre: string;
  /** Apellidos, sólo para mostrar el nombre completo y las iniciales. */
  apellidos: string;
  /** Duración de la cuenta regresiva en segundos. */
  segundos: number;
  /** Acción a ejecutar al agotarse la cuenta regresiva o al pulsar "Continuar". */
  alTerminar: () => void;
}

interface EstadoTransicion {
  transicion: Transicion | null;
  /** Abre la pantalla de transición (reemplaza una anterior sin ejecutarla). */
  mostrar: (
    transicion: Omit<Transicion, 'segundos'> & { segundos?: number },
  ) => void;
  /** Cierra la pantalla ejecutando la acción pendiente. */
  completar: () => void;
  /** Cierra la pantalla sin ejecutar la acción pendiente. */
  cancelar: () => void;
}

export const useSesionTransicionStore = create<EstadoTransicion>((set, get) => ({
  transicion: null,
  mostrar: (nueva) => {
    const actual = get().transicion;
    // Si ya hay una transición del mismo tipo en curso no se reinicia el temporizador
    // (evita reinicios encadenados por varios 401 simultáneos).
    if (actual && actual.tipo === nueva.tipo) return;
    set({
      transicion: {
        tipo: nueva.tipo,
        nombre: nueva.nombre,
        apellidos: nueva.apellidos,
        segundos: nueva.segundos ?? SEGUNDOS_REDIRECCION,
        alTerminar: nueva.alTerminar,
      },
    });
  },
  completar: () => {
    const actual = get().transicion;
    // Se limpia antes de ejecutar para permitir reentrancia (navegaciones, logout...).
    set({ transicion: null });
    actual?.alTerminar();
  },
  cancelar: () => set({ transicion: null }),
}));