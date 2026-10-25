import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldAlert,
} from 'lucide-react';

const ICONOS: Record<string, typeof AlertTriangle> = {
  success: CheckCircle,
  error: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

export interface PropiedadesAlert {
  tipo?: 'success' | 'error' | 'warning' | 'info';
  titulo?: string;
  descripcion?: string;
  niños?: ReactNode;
  accion?: ReactNode;
  descartable?: boolean;
  onDescartar?: () => void;
}

export function Alert({
  tipo = 'info',
  titulo,
  descripcion,
  niños,
  accion,
  descartable = false,
  onDescartar,
}: PropiedadesAlert) {
  const Icono = ICONOS[tipo];

  const configuracion: Record<string, { color: string; fondo: string; borde: string }> = {
    success: {
      color: 'text-success',
      fondo: 'bg-success/10',
      borde: 'border-success/30',
    },
    error: {
      color: 'text-destructive',
      fondo: 'bg-destructive/10',
      borde: 'border-destructive/30',
    },
    warning: {
      color: 'text-warning',
      fondo: 'bg-warning/10',
      borde: 'border-warning/30',
    },
    info: {
      color: 'text-info',
      fondo: 'bg-info/10',
      borde: 'border-info/30',
    },
  };

  const cfg = configuracion[tipo];

  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 flex items-start gap-3 animate-slide-down',
        cfg.fondo,
        cfg.borde,
        'shadow-sm',
      )}
    >
      <div className="flex shrink-0 items-center justify-center h-5 w-5 rounded-full bg-white/10">
        <Icono className={`h-4 w-4 ${cfg.color}`} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        {titulo && (
          <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
        )}
        {descripcion && (
          <p className="mt-0.5 text-sm text-muted leading-relaxed">{descripcion}</p>
        )}
        {niños && <div className="mt-2">{niños}</div>}
      </div>
      {accion && (
        <div className="flex shrink-0 items-center ml-2">{accion}</div>
      )}
      {descartable && onDescartar && (
        <button
          type="button"
          onClick={onDescartar}
          aria-label="Descartar alerta"
          className="absolute top-2 right-2 rounded-md p-1 text-muted hover:bg-surface/50 hover:text-foreground transition-colors"
        >
          <span className="sr-only">Descartar</span>
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}