import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useMeQuery } from '@/hooks/useMeQuery';
import { Logo } from '@/components/logo';

interface PropiedadesProtectedRoute {
  children: ReactNode;
}

export function ProtectedRoute({ children }: PropiedadesProtectedRoute) {
  const token = useAuthStore((estado) => estado.token);
  const usuario = useAuthStore((estado) => estado.usuario);
  const location = useLocation();
  const consultaMe = useMeQuery();

  if (!token) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  // Primera carga sin usuario en memoria: esperar a validar el token.
  if (!usuario && consultaMe.isFetching) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Logo />
        <p className="text-sm text-muted">Cargando tu taller...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
