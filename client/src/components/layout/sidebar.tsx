import { NavLink } from 'react-router-dom';
import { ChevronsLeft, LogOut, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { itemsInferiores, itemsMenu } from '@/components/layout/nav';
import { cn } from '@/lib/utils';
import { useSesionTransicion } from '@/hooks/useSesionTransicion';

interface PropiedadesSidebar {
  colapsada: boolean;
  onAlternar: () => void;
  abiertaMovil: boolean;
  onCerrarMovil: () => void;
}

export function Sidebar({ colapsada, onAlternar, abiertaMovil, onCerrarMovil }: PropiedadesSidebar) {
  const { despedir } = useSesionTransicion();

  const enlaceClase = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted hover:bg-surface hover:text-foreground',
      colapsada && 'justify-center px-0',
    );

  const contenido = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-border px-4',
          colapsada && 'justify-center px-0',
        )}
      >
        <NavLink to="/dashboard" aria-label="Ir al dashboard" onClick={onCerrarMovil}>
          <Logo compacto={colapsada} />
        </NavLink>
        <button
          type="button"
          onClick={onCerrarMovil}
          aria-label="Cerrar menú"
          className="ml-auto rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground md:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {itemsMenu.map((item) => (
          <NavLink key={item.ruta} to={item.ruta} className={enlaceClase} onClick={onCerrarMovil}>
            <item.icono className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!colapsada && <span className="truncate">{item.etiqueta}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        {itemsInferiores.map((item) => (
          <NavLink key={item.ruta} to={item.ruta} className={enlaceClase} onClick={onCerrarMovil}>
            <item.icono className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!colapsada && <span className="truncate">{item.etiqueta}</span>}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => {
            onCerrarMovil();
            despedir();
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-destructive',
            colapsada && 'justify-center px-0',
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!colapsada && <span>Cerrar sesión</span>}
        </button>

        <button
          type="button"
          onClick={onAlternar}
          aria-label={colapsada ? 'Expandir menú' : 'Contraer menú'}
          className={cn(
            'hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground md:flex',
            colapsada && 'justify-center px-0',
          )}
        >
          <ChevronsLeft
            className={cn('h-5 w-5 shrink-0 transition-transform', colapsada && 'rotate-180')}
            aria-hidden="true"
          />
          {!colapsada && <span>Contraer</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-border bg-surface/60 backdrop-blur transition-[width] duration-200 md:block',
          colapsada ? 'w-[4.5rem]' : 'w-64',
        )}
      >
        {contenido}
      </aside>

      {/* Móvil: cajón lateral */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity md:hidden',
          abiertaMovil ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!abiertaMovil}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCerrarMovil}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 h-full w-[17rem] max-w-[85vw] border-r border-border bg-card shadow-2xl transition-transform duration-200',
            abiertaMovil ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {contenido}
        </aside>
      </div>
    </>
  );
}
