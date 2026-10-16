import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variantesBadge = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'border-white/[0.08] bg-surface text-muted',
        primary: 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_10px_rgba(245,158,11,0.15)]',
        success: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
        danger: 'border-rose-500/35 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
        warning: 'border-amber-500/35 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
        info: 'border-sky-500/35 bg-sky-500/10 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.15)]',
        violet: 'border-violet-400/35 bg-violet-400/10 text-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.15)]',
        sky: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]',
        teal: 'border-teal-400/35 bg-teal-400/10 text-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.15)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface PropiedadesBadge
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof variantesBadge> {
  /** Muestra un punto del color del badge. */
  conPunto?: boolean;
}

export function Badge({ className, variant, conPunto = false, ...props }: PropiedadesBadge) {
  return (
    <span className={cn(variantesBadge({ variant }), className)} {...props}>
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
