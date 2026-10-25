import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface PropiedadesProgress
  extends HTMLAttributes<HTMLDivElement> {
  valor?: number;
  tamaño?: 'sm' | 'md' | 'lg';
  variante?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  mostrarValor?: boolean;
}

const TAMAÑOS: Record<string, string> = {
  sm: 'h-1.5 rounded-full',
  md: 'h-2.5 rounded-full',
  lg: 'h-4 rounded-full',
};

const VARIANTES: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  info: 'bg-info',
};

export function Progress({
  valor = 0,
  tamaño = 'md',
  variante = 'primary',
  mostrarValor = false,
  className,
  ...props
}: PropiedadesProgress) {
  const porcentaje = Math.max(0, Math.min(100, valor));

  return (
    <div className={cn('w-full flex flex-col gap-2', className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Progreso</span>
        {mostrarValor && (
          <span className="text-xs font-semibold text-primary">{porcentaje}%</span>
        )}
      </div>
      <div
        className={cn(
          'w-full overflow-hidden border border-white/[0.1] bg-surface',
          TAMAÑOS[tamaño],
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            VARIANTES[variante],
            'shadow-[0_0_12px_currentColor]',
          )}
          style={{ width: `${porcentaje}%` }}
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}