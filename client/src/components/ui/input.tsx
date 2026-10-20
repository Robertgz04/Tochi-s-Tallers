import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface PropiedadesInput extends InputHTMLAttributes<HTMLInputElement> {
  /** Muestra texto de error debajo del campo. */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, PropiedadesInput>(
  ({ className, error, id, ...props }, ref) => {
    const idCampo = id ?? props.name;
    return (
      <div className="w-full">
        <input
          ref={ref}
          id={idCampo}
          aria-invalid={error ? true : undefined}
          className={cn(
            'flex h-11 w-full rounded-xl border border-white/[0.09] bg-surface px-4 text-sm text-foreground placeholder:text-muted/50 transition-all duration-200',
            'hover:border-white/20',
            'focus:border-primary/60 focus:bg-card-hover focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
