import { AppRoutes } from '@/routes';
import { TransicionSesion } from '@/components/transicion-sesion';

export default function App() {
  return (
    <>
      <AppRoutes />
      {/* Pantalla global de bienvenida / cierre de sesión */}
      <TransicionSesion />
    </>
  );
}
