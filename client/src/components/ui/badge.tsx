import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variantesBadge = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-muted',
        primary: 'border-primary/30 bg-primary/10 text-primary',
        success: 'border-success/30 bg-success/10 text-success',
        danger: 'border-destructive/30 bg-destructive/10 text-destructive',
        warning: 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]',
        info: 'border-info/30 bg-info/10 text-info',
        violet: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
        sky: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
        teal: 'border-teal-400/30 bg-teal-400/10 text-teal-300',
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
      {conPunto && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {props.children}
    </span>
  );
}
