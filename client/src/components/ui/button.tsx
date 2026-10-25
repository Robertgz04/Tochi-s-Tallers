import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantes = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] whitespace-nowrap cursor-pointer select-none focus-ring-primary',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary via-primary-hover to-primary text-primary-foreground font-bold shadow-[0_4px_12px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] hover:brightness-105 btn-active-ring',
        secondary:
          'bg-card border border-white/[0.09] text-foreground hover:bg-card-hover hover:border-white/20 shadow-sm hover-elevate',
        ghost: 'text-muted hover:bg-surface/80 hover:text-foreground focus-ring',
        danger:
          'bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 hover:text-destructive shadow-sm hover-elevate',
        success:
          'bg-success/15 text-success border border-success/30 hover:bg-success/25 shadow-sm hover-elevate',
        outline:
          'border border-white/[0.1] text-foreground hover:bg-surface/80 hover:border-white/20 focus-ring',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs font-semibold rounded-lg',
        md: 'h-10.5 px-4.5 text-sm font-semibold rounded-xl',
        lg: 'h-12 px-7 text-base font-semibold rounded-xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
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
