import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropiedadesStatCard {
  titulo: string;
  valor: string;
  icono: LucideIcon;
  detalle?: string;
  destacado?: boolean;
  cargando?: boolean;
}

export function StatCard({
  titulo,
  valor,
  icono: Icono,
  detalle,
  destacado = false,
  cargando = false,
}: PropiedadesStatCard) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1',
        destacado
          ? 'border border-primary/40 bg-gradient-to-br from-primary/[0.15] via-card to-surface shadow-[0_12px_36px_-8px_rgba(245,158,11,0.28)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/60 before:to-transparent'
          : 'border border-white/[0.08] bg-gradient-to-b from-card to-surface shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:border-white/20 hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.6)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted">
            {titulo}
          </p>
          {cargando ? (
            <div className="mt-2.5 h-8 w-24 animate-pulse rounded-lg bg-surface" />
          ) : (
            <p
              className={cn(
                'mt-2 text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl',
                destacado ? 'text-primary' : 'text-foreground',
              )}
            >
              {valor}
            </p>
          )}
          {detalle && !cargando && (
            <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-muted">
              <span className={cn('h-1.5 w-1.5 rounded-full', destacado ? 'bg-primary animate-pulse' : 'bg-muted-foreground/50')} />
              {detalle}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
            destacado
              ? 'bg-primary/20 text-primary ring-1 ring-primary/40 shadow-[0_0_16px_rgba(245,158,11,0.25)] group-hover:scale-105'
              : 'border border-white/[0.08] bg-surface text-muted group-hover:border-white/20 group-hover:text-foreground group-hover:scale-105',
          )}
        >
          <Icono className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
