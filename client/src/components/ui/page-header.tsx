import type { ReactNode } from 'react';

interface PropiedadesPageHeader {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({ titulo, descripcion, acciones, badge }: PropiedadesPageHeader) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{titulo}</h1>
          {badge}
        </div>
        {descripcion && <p className="mt-1 text-sm text-muted">{descripcion}</p>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}
