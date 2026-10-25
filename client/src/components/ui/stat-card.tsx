import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropiedadesStatCard {
  titulo: string;
  valor: string;
  icono: LucideIcon;
  detalle?: string;
  destacado?: boolean;
  cargando?: boolean;
  tendencia?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  titulo,
  valor,
  icono: Icono,
  detalle,
  destacado = false,
  cargando = false,
  tendencia,
}: PropiedadesStatCard & { tendencia?: 'up' | 'down' | 'neutral' }) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover-elevate hover:border-white/20',
        destacado
          ? 'border border-primary/40 bg-gradient-to-br from-primary/[0.12] via-card to-surface shadow-lg shadow-primary/20 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/60 before:to-transparent'
          : 'border border-white/[0.08] bg-gradient-to-b from-card to-surface shadow-md before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/[0.10] before:to-transparent',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {titulo}
          </p>
          {cargando ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-surface" />
          ) : (
            <p
              className={cn(
                'mt-2 text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl',
                destacado ? 'text-primary' : 'text-foreground',
              )}
            >
              {valor}
            </p>
          )}
          {detalle && !cargando && (
            <p className="mt-2 flex items-center gap-1.5 truncate text-sm text-muted">
              {tendencia === 'up' && (
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              )}
              {tendencia === 'down' && (
                <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              )}
              {tendencia === 'neutral' && (
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              )}
              {detalle}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
            destacado
              ? 'bg-primary/20 text-primary ring-1 ring-primary/40 shadow-[0_0_16px_rgba(245,158,11,0.25)] group-hover:scale-110'
              : 'border border-white/[0.08] bg-surface text-muted group-hover:border-white/20 group-hover:text-foreground group-hover:scale-110',
          )}
        >
          <Icono className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
