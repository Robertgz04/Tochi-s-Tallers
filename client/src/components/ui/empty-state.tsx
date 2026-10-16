import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropiedadesEmptyState {
  icono?: ReactNode;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}

export function EmptyState({
  icono,
  titulo,
  descripcion,
  accion,
  className,
}: PropiedadesEmptyState) {
  return (
    <div
      className={cn(
        'relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-surface/30 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#161b24] text-primary shadow-[0_0_24px_rgba(245,158,11,0.14)]">
        {icono ?? <Inbox className="h-7 w-7" aria-hidden="true" />}
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">{titulo}</h3>
      {descripcion && <p className="mt-1.5 max-w-sm text-sm text-muted">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}
