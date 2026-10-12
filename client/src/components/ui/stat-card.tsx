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
        'group rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5',
        destacado
          ? 'border-primary/30 bg-gradient-to-br from-primary/[0.08] to-card shadow-[0_4px_20px_-8px_rgba(245,158,11,0.35)]'
          : 'border-border shadow-[0_1px_3px_rgba(0,0,0,0.35)] hover:border-border-strong',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted">
            {titulo}
          </p>
          {cargando ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded-md bg-surface" />
          ) : (
            <p
              className={cn(
                'mt-1.5 text-2xl font-bold tabular-nums tracking-tight',
                destacado ? 'text-primary' : 'text-foreground',
              )}
            >
              {valor}
            </p>
          )}
          {detalle && !cargando && (
            <p className="mt-1 truncate text-xs text-muted">{detalle}</p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
            destacado
              ? 'bg-primary/15 text-primary'
              : 'bg-surface text-muted group-hover:text-foreground',
          )}
        >
          <Icono className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
