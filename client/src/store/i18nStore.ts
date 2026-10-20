import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Idioma = 'es' | 'en';

export const DICCIONARIO: Record<Idioma, Record<string, string>> = {
  es: {
    // Navegación
    'nav.dashboard': 'Dashboard',
    'nav.clientes': 'Clientes',
    'nav.vehiculos': 'Vehículos',
    'nav.ordenes': 'Órdenes de trabajo',
    'nav.cotizaciones': 'Cotizaciones',
    'nav.pagos': 'Pagos y Caja',
    'nav.inventario': 'Inventario',
    'nav.agenda': 'Agenda',
    'nav.reportes': 'Reportes',
    'nav.equipo': 'Equipo',
    'nav.configuracion': 'Configuración',
    'nav.miTaller': 'Mi taller',
    'nav.perfil': 'Mi Perfil',
    'nav.cerrarSesion': 'Cerrar sesión',
    'nav.contraer': 'Contraer',
    'nav.enLinea': 'En línea',
    'nav.inicio': 'Inicio',

    // Encabezado
    'header.notificaciones': 'Notificaciones',
    'header.modoDia': 'Cambiar a Modo Día',
    'header.modoNoche': 'Cambiar a Modo Noche',
    'header.cambiarIdioma': 'Cambiar idioma',
    'header.idiomaCambiado': 'Idioma cambiado a Español',
    'header.miPerfilSocial': 'Mi perfil social',

    // Reportes
    'rep.titulo': 'Reportes y Estadísticas',
    'rep.subtitulo': 'Indicadores financieros, operativos y métricas de rendimiento en tiempo real.',
    'rep.extraer': 'Extraer Datos',
    'rep.importar': 'Importar Datos',
    'rep.exportarCSV': 'Exportar a CSV / Excel',
    'rep.exportarJSON': 'Exportar a JSON',
    'rep.imprimir': 'Imprimir Informe / PDF',
    'rep.finanzas': 'Finanzas y Recaudación',
    'rep.ingresosMes': 'Ingresos del mes',
    'rep.facturado': 'Total facturado',
    'rep.cobrado': 'Total cobrado',
    'rep.porCobrar': 'Por cobrar',
    'rep.factVsCobro': 'Facturación vs Cobranza Mensual',
    'rep.rendimientoMecanicos': 'Rendimiento por Técnico / Mecánico',
    'rep.distribucionCanal': 'Distribución de Cobranza por Canal',
    'rep.ingresosTaller': 'Ingresos del taller',
    'rep.ordenesPorEstado': 'Órdenes por estado',
    'rep.clientesFacturan': 'Clientes que más facturan',
    'rep.productividadResponsable': 'Tabla Detallada de Productividad por Mecánico',
    'rep.embudoCotizaciones': 'Embudo y Eficacia de Cotizaciones',
    'rep.resumenOperativo': 'Resumen Operativo Global',
    'rep.clientes': 'Clientes',
    'rep.vehiculos': 'Vehículos',
    'rep.ordenesTotales': 'Órdenes totales',
    'rep.entregadas': 'Entregadas',

    // Perfil
    'perfil.titulo': 'Perfil Social del Mecánico',
    'perfil.cambiarPortada': 'Cambiar Portada (GIF/JPG)',
    'perfil.editarPerfil': 'Editar Perfil Social',
    'perfil.snapcode': 'Snapcode / Compartir',
    'perfil.publicarTrabajo': 'Publicar Trabajo',
    'perfil.rachaActiva': 'Racha Activa: 45 días',
    'perfil.muro': 'Muro de Trabajos & Evidencias',
    'perfil.sobreMi': 'Sobre Mí & Contacto',
    'perfil.metricas': 'Rendimiento & Métricas',
    'perfil.meGusta': 'Me gusta',
    'perfil.comentar': 'Comentar',
    'perfil.compartir': 'Compartir',
    'perfil.verificado': 'Verificado',

    // Configuración
    'cfg.titulo': 'Centro de Configuración Integral',
    'cfg.subtitulo': 'Administra la facturación, notificaciones WhatsApp, apariencia, seguridad y respaldos masivos de tu taller.',
    'cfg.general': 'General & Facturación',
    'cfg.notificaciones': 'Notificaciones & WhatsApp',
    'cfg.apariencia': 'Apariencia & Tema',
    'cfg.seguridad': 'Seguridad & Auditoría',
    'cfg.respaldo': 'Respaldos Masivos & BD',
    'cfg.suscripcion': 'Plan & Suscripción',
    'cfg.guardar': 'Guardar Cambios',
    'cfg.idioma': 'Idioma del Sistema',
    'cfg.modoTema': 'Modo de Color / Tema',
    'cfg.modoClaro': 'Modo Día (Claro)',
    'cfg.modoOscuro': 'Modo Noche (Oscuro)',
    'cfg.backupDescargar': 'Generar y Descargar Respaldo Completo',
    'cfg.restaurarBackup': 'Restaurar Copia de Seguridad',
    'cfg.optimizarCache': 'Optimizar Caché',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.clientes': 'Customers',
    'nav.vehiculos': 'Vehicles',
    'nav.ordenes': 'Work Orders',
    'nav.cotizaciones': 'Estimates & Quotes',
    'nav.pagos': 'Payments & Register',
    'nav.inventario': 'Inventory',
    'nav.agenda': 'Schedule',
    'nav.reportes': 'Reports & Analytics',
    'nav.equipo': 'Team & Staff',
    'nav.configuracion': 'Settings',
    'nav.miTaller': 'My Workshop',
    'nav.perfil': 'My Profile',
    'nav.cerrarSesion': 'Sign Out',
    'nav.contraer': 'Collapse',
    'nav.enLinea': 'Online',
    'nav.inicio': 'Home',

    // Header
    'header.notificaciones': 'Notifications',
    'header.modoDia': 'Switch to Light Mode',
    'header.modoNoche': 'Switch to Dark Mode',
    'header.cambiarIdioma': 'Switch language',
    'header.idiomaCambiado': 'Language switched to English',
    'header.miPerfilSocial': 'My Social Profile',

    // Reports
    'rep.titulo': 'Reports & Analytics',
    'rep.subtitulo': 'Real-time financial, operational and performance key metrics.',
    'rep.extraer': 'Extract Data',
    'rep.importar': 'Import Data',
    'rep.exportarCSV': 'Export to CSV / Excel',
    'rep.exportarJSON': 'Export to JSON',
    'rep.imprimir': 'Print Report / PDF',
    'rep.finanzas': 'Finances & Collection',
    'rep.ingresosMes': 'Monthly Revenue',
    'rep.facturado': 'Total Invoiced',
    'rep.cobrado': 'Total Collected',
    'rep.porCobrar': 'Accounts Receivable',
    'rep.factVsCobro': 'Invoicing vs Cash Collection',
    'rep.rendimientoMecanicos': 'Performance by Technician / Mechanic',
    'rep.distribucionCanal': 'Revenue Distribution by Channel',
    'rep.ingresosTaller': 'Workshop Incomes',
    'rep.ordenesPorEstado': 'Orders by Status',
    'rep.clientesFacturan': 'Top Invoicing Customers',
    'rep.productividadResponsable': 'Productivity Table by Mechanic',
    'rep.embudoCotizaciones': 'Estimates & Conversion Funnel',
    'rep.resumenOperativo': 'Global Operational Summary',
    'rep.clientes': 'Customers',
    'rep.vehiculos': 'Vehicles',
    'rep.ordenesTotales': 'Total Orders',
    'rep.entregadas': 'Delivered',

    // Profile
    'perfil.titulo': 'Mechanic Social Profile',
    'perfil.cambiarPortada': 'Change Cover (GIF/JPG)',
    'perfil.editarPerfil': 'Edit Social Profile',
    'perfil.snapcode': 'Snapcode / Share',
    'perfil.publicarTrabajo': 'Post Work',
    'perfil.rachaActiva': 'Active Streak: 45 days',
    'perfil.muro': 'Work & Evidence Wall',
    'perfil.sobreMi': 'About Me & Contact',
    'perfil.metricas': 'Performance & Metrics',
    'perfil.meGusta': 'Like',
    'perfil.comentar': 'Comment',
    'perfil.compartir': 'Share',
    'perfil.verificado': 'Verified',

    // Settings
    'cfg.titulo': 'Comprehensive Settings Center',
    'cfg.subtitulo': 'Manage workshop billing, WhatsApp notifications, theme, security and database backups.',
    'cfg.general': 'General & Billing',
    'cfg.notificaciones': 'Notifications & WhatsApp',
    'cfg.apariencia': 'Appearance & Theme',
    'cfg.seguridad': 'Security & Audit',
    'cfg.respaldo': 'Mass Backups & DB',
    'cfg.suscripcion': 'Plan & Subscription',
    'cfg.guardar': 'Save Changes',
    'cfg.idioma': 'System Language',
    'cfg.modoTema': 'Color Mode / Theme',
    'cfg.modoClaro': 'Light Mode (Day)',
    'cfg.modoOscuro': 'Dark Mode (Night)',
    'cfg.backupDescargar': 'Generate & Download Full Backup',
    'cfg.restaurarBackup': 'Restore Backup',
    'cfg.optimizarCache': 'Optimize Cache',
  },
};

interface EstadoI18n {
  idioma: Idioma;
  establecerIdioma: (nuevoIdioma: Idioma) => void;
  alternarIdioma: () => void;
  t: (clave: string, fallback?: string) => string;
}

export const useI18nStore = create<EstadoI18n>()(
  persist(
    (set, get) => ({
      idioma: 'es',
      establecerIdioma: (nuevoIdioma) => {
        set({ idioma: nuevoIdioma });
      },
      alternarIdioma: () => {
        const actual = get().idioma;
        const nuevo = actual === 'es' ? 'en' : 'es';
        set({ idioma: nuevo });
      },
      t: (clave: string, fallback?: string) => {
        const { idioma } = get();
        return DICCIONARIO[idioma]?.[clave] ?? fallback ?? clave;
      },
    }),
    {
      name: 'tochistaller-idioma',
    },
  ),
);

