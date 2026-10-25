import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variantesBadge = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-none whitespace-nowrap transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-white/[0.08] bg-surface text-muted hover:bg-surface/80 hover:text-foreground',
        primary:
          'border-primary/40 bg-primary/10 text-primary shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:bg-primary/20',
        success:
          'border-emerald-500/35 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:bg-emerald-500/20',
        danger:
          'border-rose-500/35 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)] hover:bg-rose-500/20',
        warning:
          'border-amber-500/35 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:bg-amber-500/20',
        info:
          'border-sky-500/35 bg-sky-500/10 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.15)] hover:bg-sky-500/20',
        violet:
          'border-violet-400/35 bg-violet-400/10 text-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.15)] hover:bg-violet-400/20',
        sky:
          'border-cyan-400/35 bg-cyan-400/10 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)] hover:bg-cyan-400/20',
        teal:
          'border-teal-400/35 bg-teal-400/10 text-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.15)] hover:bg-teal-400/20',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3.5 py-1 text-sm',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface PropiedadesBadge
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof variantesBadge> {
  /** Muestra un punto del color del badge. */
  conPunto?: boolean;
}

export function Badge({ className, variant, size, conPunto = false, ...props }: PropiedadesBadge) {
  return (
    <span className={cn(variantesBadge({ variant, size }), className)} {...props}>
      {conPunto && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]"
          aria-hidden="true"
        />
      )}
      {props.children}
    </span>
  );
}

export function BadgeEstado({
  estado,
  className,
}: {
  estado:
    | 'pendiente'
    | 'en_proceso'
    | 'completado'
    | 'cancelado'
    | 'entregado'
    | 'facturado'
    | 'borrador'
    | 'aprobado'
    | 'rechazado'
    | string;
  className?: string;
}) {
  const mapa: Record<string, { variant: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info'; label: string }> = {
    pendiente: { variant: 'warning', label: 'Pendiente' },
    en_proceso: { variant: 'info', label: 'En proceso' },
    completado: { variant: 'success', label: 'Completado' },
    cancelado: { variant: 'danger', label: 'Cancelado' },
    entregado: { variant: 'success', label: 'Entregado' },
    facturado: { variant: 'default', label: 'Facturado' },
    borrador: { variant: 'default', label: 'Borrador' },
    aprobado: { variant: 'success', label: 'Aprobado' },
    rechazado: { variant: 'danger', label: 'Rechazado' },
  };

  const config = mapa[estado] || { variant: 'default', label: estado };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
