import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PropiedadesSelect extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, PropiedadesSelect>(
  ({ className, error, children, ...props }, ref) => (
    <div className="w-full">
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-white/[0.09] bg-surface px-4 pr-10 text-sm font-medium text-foreground transition-all duration-200 cursor-pointer',
            'hover:border-white/20',
            'focus:border-primary/60 focus:bg-card-hover focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-500/70',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';
