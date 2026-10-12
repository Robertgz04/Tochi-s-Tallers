import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { ModulePlaceholder } from '@/components/module-placeholder';

const LoginPage = lazy(() => import('@/pages/auth/login-page'));
const RegisterPage = lazy(() => import('@/pages/auth/register-page'));
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard-page'));
const EquipoPage = lazy(() => import('@/pages/equipo/equipo-page'));
const MiTallerPage = lazy(() => import('@/pages/taller/mi-taller-page'));
const NotFoundPage = lazy(() => import('@/pages/placeholder/not-found-page'));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/equipo" element={<EquipoPage />} />
        <Route path="/mi-taller" element={<MiTallerPage />} />

        {/* Módulos de fases posteriores (navegación ya preparada) */}
        <Route
          path="/clientes"
          element={<ModulePlaceholder titulo="Clientes" fase="FASE 2" />}
        />
        <Route
          path="/vehiculos"
          element={<ModulePlaceholder titulo="Vehículos" fase="FASE 2" />}
        />
        <Route
          path="/ordenes"
          element={<ModulePlaceholder titulo="Órdenes de trabajo" fase="FASE 3" />}
        />
        <Route
          path="/cotizaciones"
          element={<ModulePlaceholder titulo="Cotizaciones" fase="FASE 4" />}
        />
        <Route path="/pagos" element={<ModulePlaceholder titulo="Pagos" fase="FASE 5" />} />
        <Route
          path="/inventario"
          element={<ModulePlaceholder titulo="Inventario" fase="FASE 6" />}
        />
        <Route path="/agenda" element={<ModulePlaceholder titulo="Agenda" fase="FASE 6" />} />
        <Route
          path="/reportes"
          element={<ModulePlaceholder titulo="Reportes" fase="FASE 7" />}
        />
        <Route
          path="/configuracion"
          element={<ModulePlaceholder titulo="Configuración" fase="FASE 2" />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
