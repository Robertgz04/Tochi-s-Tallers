import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DashboardSkeleton } from '@/components/ui/skeleton';

const CLAVE_COLAPSO = 'tochistaller-sidebar-colapsado';

export function AppLayout() {
  const [colapsada, setColapsada] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CLAVE_COLAPSO) === '1';
  });
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const alternarColapso = () => {
    setColapsada((valor) => {
      const siguiente = !valor;
      window.localStorage.setItem(CLAVE_COLAPSO, siguiente ? '1' : '0');
      return siguiente;
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        colapsada={colapsada}
        onAlternar={alternarColapso}
        abiertaMovil={menuMovilAbierto}
        onCerrarMovil={() => setMenuMovilAbierto(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onAbrirMenu={() => setMenuMovilAbierto(true)} />
        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-8 lg:px-8">
          <Suspense fallback={<DashboardSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <BottomNav onAbrirMenu={() => setMenuMovilAbierto(true)} />
    </div>
  );
}
