import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Building2, LogOut, Menu, UserRound } from 'lucide-react';
import { InstallPWA } from '@/components/install-pwa';
import { titulosRutas } from '@/components/layout/nav';
import { useAuthStore } from '@/store/authStore';
import { useSesionTransicion } from '@/hooks/useSesionTransicion';
import { ETIQUETAS_ROLES, type Rol } from '@/types';
import { iniciales, nombreCompleto } from '@/lib/utils';

interface PropiedadesHeader {
  onAbrirMenu: () => void;
}

export function Header({ onAbrirMenu }: PropiedadesHeader) {
  const location = useLocation();
  const usuario = useAuthStore((estado) => estado.usuario);
  const { despedir } = useSesionTransicion();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const titulo = titulosRutas[location.pathname] ?? 'Tochi’sTaller';

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuAbierto) return;
    const alClickear = (evento: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', alClickear);
    return () => document.removeEventListener('mousedown', alClickear);
  }, [menuAbierto]);

  const nombre = usuario ? nombreCompleto(usuario.nombre, usuario.apellidos) : '';
  const avatar = usuario ? iniciales(usuario.nombre, usuario.apellidos) : '?';
  const rol = usuario ? ETIQUETAS_ROLES[usuario.rol as Rol] : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
        className="rounded-xl p-2 text-muted transition-colors hover:bg-surface hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{titulo}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:block">
          <InstallPWA />
        </div>

        <button
          type="button"
          aria-label="Notificaciones (próximamente)"
          title="Notificaciones — próximamente"
          className="relative rounded-xl p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuAbierto((valor) => !valor)}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface pl-1.5 pr-2.5 transition-colors hover:border-border-strong"
            aria-label="Menú de usuario"
            aria-expanded={menuAbierto}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
              {avatar}
            </span>
            <span className="hidden text-sm font-medium text-foreground sm:block">
              {nombre.split(' ')[0]}
            </span>
          </button>

          {menuAbierto && usuario && (
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-scale-in">
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-semibold text-foreground">{nombre}</p>
                <p className="truncate text-xs text-muted">{usuario.correo}</p>
                <span className="mt-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {rol}
                </span>
              </div>
              <div className="p-1.5">
                <Link
                  to="/mi-taller"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  Mi taller
                </Link>
                <Link
                  to="/configuracion"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Mi perfil
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuAbierto(false);
                    despedir();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
