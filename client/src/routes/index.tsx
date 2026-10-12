import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';

const LoginPage = lazy(() => import('@/pages/auth/login-page'));
const RegisterPage = lazy(() => import('@/pages/auth/register-page'));
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard-page'));
const EquipoPage = lazy(() => import('@/pages/equipo/equipo-page'));
const MiTallerPage = lazy(() => import('@/pages/taller/mi-taller-page'));
const ClientesPage = lazy(() => import('@/pages/clientes/clientes-page'));
const VehiculosPage = lazy(() => import('@/pages/vehiculos/vehiculos-page'));
const OrdenesPage = lazy(() => import('@/pages/ordenes/ordenes-page'));
const CotizacionesPage = lazy(() => import('@/pages/cotizaciones/cotizaciones-page'));
const PagosPage = lazy(() => import('@/pages/pagos/pagos-page'));
const ReportesPage = lazy(() => import('@/pages/reportes/reportes-page'));
const InventarioPage = lazy(() => import('@/pages/inventario/inventario-page'));
const AgendaPage = lazy(() => import('@/pages/agenda/agenda-page'));
const ConfiguracionPage = lazy(() => import('@/pages/configuracion/configuracion-page'));
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

        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/ordenes" element={<OrdenesPage />} />
        <Route path="/cotizaciones" element={<CotizacionesPage />} />
        <Route path="/pagos" element={<PagosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
