import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantes = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_rgba(245,158,11,0.45)] hover:bg-primary-hover',
        secondary: 'bg-surface border border-border text-foreground hover:bg-card-hover hover:border-border-strong',
        ghost: 'text-muted hover:bg-surface hover:text-foreground',
        danger: 'bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25',
        success: 'bg-success/15 text-success border border-success/30 hover:bg-success/25',
        outline: 'border border-border text-foreground hover:bg-surface',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface PropiedadesBoton
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variantes> {
  cargando?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, PropiedadesBoton>(
  ({ className, variant, size, cargando = false, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(variantes({ variant, size }), className)}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
