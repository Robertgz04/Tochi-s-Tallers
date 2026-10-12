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
            'flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted/60 transition-colors',
            'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20',
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
