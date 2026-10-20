import type { CSSProperties } from 'react';
import { useThemeStore } from '@/store/themeStore';

interface ColoresGrafica {
  tema: 'dark' | 'light';
  /** Líneas de la cuadrícula de recharts según el tema activo. */
  colorCuadricula: string;
  /** Texto de ejes con alto contraste (etiquetas oscuras/claras). */
  colorTextoAltoContraste: string;
  /** Estilo del tooltip de recharts según el tema activo. */
  estiloTooltip: CSSProperties;
}

/** Colores de recharts (cuadrícula, ejes y tooltip) que siguen el tema día/noche. */
export function useColoresGrafica(): ColoresGrafica {
  const tema = useThemeStore((estado) => estado.tema);
  const claro = tema === 'light';

  return {
    tema,
    colorCuadricula: claro ? '#e2e8f0' : '#262D36',
    colorTextoAltoContraste: claro ? '#0f172a' : '#F8FAFC',
    estiloTooltip: {
      backgroundColor: claro ? '#ffffff' : '#151a23',
      border: claro ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: 14,
      fontSize: 12,
      color: claro ? '#0f172a' : '#F8FAFC',
      boxShadow: claro
        ? '0 12px 30px -5px rgba(15, 23, 42, 0.18)'
        : '0 12px 30px -5px rgba(0, 0, 0, 0.65)',
    },
  };
}
