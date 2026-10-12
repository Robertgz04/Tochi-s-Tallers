import {
  BarChart3,
  Building2,
  CalendarDays,
  Car,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface ItemNavegacion {
  ruta: string;
  etiqueta: string;
  icono: LucideIcon;
}

export const itemsMenu: ItemNavegacion[] = [
  { ruta: '/dashboard', etiqueta: 'Dashboard', icono: LayoutDashboard },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users },
  { ruta: '/vehiculos', etiqueta: 'Vehículos', icono: Car },
  { ruta: '/ordenes', etiqueta: 'Órdenes', icono: ClipboardList },
  { ruta: '/cotizaciones', etiqueta: 'Cotizaciones', icono: FileText },
  { ruta: '/pagos', etiqueta: 'Pagos', icono: Wallet },
  { ruta: '/inventario', etiqueta: 'Inventario', icono: Package },
  { ruta: '/agenda', etiqueta: 'Agenda', icono: CalendarDays },
  { ruta: '/reportes', etiqueta: 'Reportes', icono: BarChart3 },
  { ruta: '/equipo', etiqueta: 'Equipo', icono: UsersRound },
];

export const itemsInferiores: ItemNavegacion[] = [
  { ruta: '/configuracion', etiqueta: 'Configuración', icono: Settings },
  { ruta: '/mi-taller', etiqueta: 'Mi taller', icono: Building2 },
];

export const itemsNavegacionMovil: ItemNavegacion[] = [
  { ruta: '/dashboard', etiqueta: 'Inicio', icono: LayoutDashboard },
  { ruta: '/ordenes', etiqueta: 'Órdenes', icono: ClipboardList },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users },
];

export const opcionesCrear = [
  { ruta: '/ordenes', etiqueta: 'Nueva orden', icono: ClipboardList },
  { ruta: '/clientes', etiqueta: 'Nuevo cliente', icono: UserRound },
  { ruta: '/vehiculos', etiqueta: 'Nuevo vehículo', icono: Car },
  { ruta: '/cotizaciones', etiqueta: 'Nueva cotización', icono: FileText },
];

export const titulosRutas: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clientes': 'Clientes',
  '/vehiculos': 'Vehículos',
  '/ordenes': 'Órdenes de trabajo',
  '/cotizaciones': 'Cotizaciones',
  '/pagos': 'Pagos',
  '/inventario': 'Inventario',
  '/agenda': 'Agenda',
  '/reportes': 'Reportes',
  '/equipo': 'Equipo',
  '/configuracion': 'Configuración',
  '/mi-taller': 'Mi taller',
};
