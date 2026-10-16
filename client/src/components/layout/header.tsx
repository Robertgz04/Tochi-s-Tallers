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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.08] bg-[#090b0e]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
        className="cursor-pointer rounded-xl border border-white/[0.08] p-2 text-muted transition-colors hover:border-white/20 hover:bg-surface hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">{titulo}</h1>
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 sm:inline-flex shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En línea
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="hidden sm:block">
          <InstallPWA />
        </div>

        <button
          type="button"
          aria-label="Notificaciones (próximamente)"
          title="Notificaciones — próximamente"
          className="relative cursor-pointer rounded-xl border border-white/[0.08] bg-surface/80 p-2 text-muted transition-colors hover:border-white/20 hover:text-foreground"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-[#090b0e]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuAbierto((valor) => !valor)}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/[0.09] bg-surface/90 pl-1.5 pr-3 transition-all hover:border-white/20 hover:bg-surface"
            aria-label="Menú de usuario"
            aria-expanded={menuAbierto}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-xs font-bold text-primary ring-1 ring-primary/40 shadow-sm">
              {avatar}
            </span>
            <span className="hidden text-sm font-semibold text-foreground sm:block">
              {nombre.split(' ')[0]}
            </span>
          </button>

          {menuAbierto && usuario && (
            <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#141922]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-scale-in">
              <div className="border-b border-white/[0.06] bg-surface/50 px-4 py-3.5">
                <p className="truncate text-sm font-bold text-foreground">{nombre}</p>
                <p className="truncate text-xs text-muted">{usuario.correo}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {rol}
                </span>
              </div>
              <div className="space-y-0.5 p-1.5">
                <Link
                  to="/mi-taller"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.05] hover:text-foreground"
                >
                  <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Mi taller
                </Link>
                <Link
                  to="/configuracion"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.05] hover:text-foreground"
                >
                  <UserRound className="h-4 w-4 text-sky-400" aria-hidden="true" />
                  Mi perfil
                </Link>
                <div className="my-1 border-t border-white/[0.06]" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuAbierto(false);
                    despedir();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-destructive/15 hover:text-destructive"
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
