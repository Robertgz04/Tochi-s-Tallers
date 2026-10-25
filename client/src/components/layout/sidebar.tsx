import { NavLink } from 'react-router-dom';
import { ChevronsLeft, LogOut, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { itemsInferiores, itemsMenu } from '@/components/layout/nav';
import { cn } from '@/lib/utils';
import { useSesionTransicion } from '@/hooks/useSesionTransicion';
import { useI18nStore } from '@/store/i18nStore';

interface PropiedadesSidebar {
  colapsada: boolean;
  onAlternar: () => void;
  abiertaMovil: boolean;
  onCerrarMovil: () => void;
}

const MAPA_RUTAS_I18N: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/clientes': 'nav.clientes',
  '/vehiculos': 'nav.vehiculos',
  '/ordenes': 'nav.ordenes',
  '/cotizaciones': 'nav.cotizaciones',
  '/pagos': 'nav.pagos',
  '/inventario': 'nav.inventario',
  '/agenda': 'nav.agenda',
  '/reportes': 'nav.reportes',
  '/equipo': 'nav.equipo',
  '/configuracion': 'nav.configuracion',
  '/mi-taller': 'nav.miTaller',
  '/perfil': 'nav.perfil',
};

export function Sidebar({ colapsada, onAlternar, abiertaMovil, onCerrarMovil }: PropiedadesSidebar) {
  const { despedir } = useSesionTransicion();
  const { t } = useI18nStore();

  const enlaceClase = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-ring',
      isActive
        ? 'bg-gradient-to-r from-primary/18 via-primary/8 to-transparent text-primary shadow-[inset_0_1px_0_rgba(245,158,11,0.15)] before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:rounded-r-full before:bg-primary before:shadow-[0_0_10px_rgba(245,158,11,0.85)]'
        : 'text-muted hover:bg-white/[0.04] hover:text-foreground',
      colapsada && 'justify-center px-0 before:hidden',
    );

  const contenido = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-white/[0.08] px-4',
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
          className="ml-auto cursor-pointer rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground md:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {itemsMenu.map((item) => {
          const etiqueta = t(MAPA_RUTAS_I18N[item.ruta] ?? '', item.etiqueta);
          return (
            <NavLink key={item.ruta} to={item.ruta} className={enlaceClase} onClick={onCerrarMovil}>
              <item.icono className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" aria-hidden="true" />
              {!colapsada && <span className="truncate">{etiqueta}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/[0.08] px-3 py-4">
        {itemsInferiores.map((item) => {
          const etiqueta = t(MAPA_RUTAS_I18N[item.ruta] ?? '', item.etiqueta);
          return (
            <NavLink key={item.ruta} to={item.ruta} className={enlaceClase} onClick={onCerrarMovil}>
              <item.icono className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" aria-hidden="true" />
              {!colapsada && <span className="truncate">{etiqueta}</span>}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => {
            onCerrarMovil();
            despedir();
          }}
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:bg-destructive/15 hover:text-destructive focus-ring',
            colapsada && 'justify-center px-0',
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!colapsada && <span>{t('nav.cerrarSesion')}</span>}
        </button>

        <button
          type="button"
          onClick={onAlternar}
          aria-label={colapsada ? 'Expandir menú' : 'Contraer menú'}
          className={cn(
            'hidden w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:bg-white/[0.04] hover:text-foreground md:flex focus-ring',
            colapsada && 'justify-center px-0',
          )}
        >
          <ChevronsLeft
            className={cn('h-5 w-5 shrink-0 transition-transform duration-200', colapsada && 'rotate-180')}
            aria-hidden="true"
          />
          {!colapsada && <span>{t('nav.contraer')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-white/[0.08] bg-surface/90 backdrop-blur-xl transition-[width] duration-200 md:block',
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
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={onCerrarMovil}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 h-full w-[17rem] max-w-[85vw] border-r border-white/[0.08] bg-card shadow-2xl transition-transform duration-200',
            abiertaMovil ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {contenido}
        </aside>
      </div>
    </>
  );
}
