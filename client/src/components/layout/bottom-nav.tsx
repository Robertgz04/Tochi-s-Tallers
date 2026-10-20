import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CirclePlus, Menu } from 'lucide-react';
import { itemsMenu, itemsNavegacionMovil, opcionesCrear } from '@/components/layout/nav';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

interface PropiedadesBottomNav {
  onAbrirMenu: () => void;
}

export function BottomNav({ onAbrirMenu }: PropiedadesBottomNav) {
  const [crearAbierto, setCrearAbierto] = useState(false);
  const navigate = useNavigate();
  const itemClientes = itemsNavegacionMovil[2];

  const enlaceClase = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
      isActive ? 'text-primary' : 'text-muted',
    );

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/[0.08] bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Navegación principal"
      >
        {itemsNavegacionMovil.slice(0, 2).map((item) => (
          <NavLink key={item.ruta} to={item.ruta} className={enlaceClase}>
            <item.icono className="h-5 w-5" aria-hidden="true" />
            {item.etiqueta}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setCrearAbierto(true)}
          className="flex flex-1 flex-col items-center gap-1 text-[11px] font-bold text-primary"
          aria-label="Crear nuevo"
        >
          <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_8px_25px_rgba(245,158,11,0.5)] transition-transform active:scale-95">
            <CirclePlus className="h-7 w-7" aria-hidden="true" />
          </span>
          Crear
        </button>

        <NavLink to={itemClientes.ruta} className={enlaceClase}>
          <itemClientes.icono className="h-5 w-5" aria-hidden="true" />
          {itemClientes.etiqueta}
        </NavLink>

        <button
          type="button"
          onClick={onAbrirMenu}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold text-muted"
          aria-label="Más opciones"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          Más
        </button>
      </nav>

      <Modal
        abierto={crearAbierto}
        onCerrar={() => setCrearAbierto(false)}
        titulo="Crear nuevo"
        descripcion="¿Qué quieres registrar en tu taller?"
        ancho="sm"
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {opcionesCrear.map((opcion) => (
            <button
              key={opcion.etiqueta}
              type="button"
              onClick={() => {
                setCrearAbierto(false);
                navigate(opcion.ruta);
              }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-card p-3.5 text-left text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 cursor-pointer"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <opcion.icono className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      </Modal>

      <span className="sr-only">{itemsMenu.length} secciones disponibles en el menú</span>
    </>
  );
}
