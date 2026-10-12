/* Tipos compartidos del cliente (espejo de la API). */

export interface RespuestaOk<T> {
  success: true;
  data: T;
}

export interface RespuestaError {
  success: false;
  message: string;
}

export type Respuesta<T> = RespuestaOk<T> | RespuestaError;

export const ROLES = [
  'SUPER_ADMIN',
  'PROPIETARIO',
  'ADMINISTRADOR',
  'RECEPCIONISTA',
  'MECANICO',
] as const;

export type Rol = (typeof ROLES)[number];

export const ETIQUETAS_ROLES: Record<Rol, string> = {
  SUPER_ADMIN: 'Super Admin',
  PROPIETARIO: 'Propietario',
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  MECANICO: 'Mecánico',
};

export interface Usuario {
  id: string;
  tallerId: string | null;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  rol: Rol;
  fotoUrl: string | null;
  activo: boolean;
  ultimoAcceso: string | null;
}

export interface SesionLogin {
  token: string;
  usuario: Usuario;
}

export interface ResultadoRegistro extends SesionLogin {
  taller: Taller;
}

export interface Taller {
  id: string;
  nombre: string;
  razonSocial: string | null;
  logoUrl: string | null;
  telefono: string | null;
  whatsapp: string | null;
  correo: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  codigoPostal: string | null;
  rfc: string | null;
  moneda: string;
  zonaHoraria: string;
  iva: number;
  prefijoFolio: string;
  activo: boolean;
  plan: string;
  fechaInicio: string | null;
  fechaVencimiento: string | null;
  estadoSuscripcion: string;
  fechaCreacion: string;
}

export const ESTADOS_ORDEN = [
  'RECIBIDO',
  'DIAGNOSTICO',
  'ESPERANDO_AUTORIZACION',
  'AUTORIZADO',
  'EN_REPARACION',
  'PRUEBAS',
  'LISTO',
  'ENTREGADO',
  'CANCELADO',
] as const;

export type EstadoOrden = (typeof ESTADOS_ORDEN)[number];

export const ETIQUETAS_ESTADOS: Record<EstadoOrden, string> = {
  RECIBIDO: 'Recibido',
  DIAGNOSTICO: 'Diagnóstico',
  ESPERANDO_AUTORIZACION: 'Esperando autorización',
  AUTORIZADO: 'Autorizado',
  EN_REPARACION: 'En reparación',
  PRUEBAS: 'Pruebas',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export interface TrabajoReciente {
  id: string;
  folio: string;
  estado: EstadoOrden;
  total: number;
  fechaIngreso: string;
  cliente: string;
  placa: string;
  vehiculo: string;
  mecanico: string | null;
}

export interface DashboardData {
  stats: {
    ordenesActivas: number;
    vehiculosListos: number;
    cotizacionesPendientes: number;
    pagosPendientes: number;
    ingresosMes: number;
  };
  ingresosMensuales: { mes: string; total: number }[];
  ordenesPorEstado: { estado: EstadoOrden; cantidad: number }[];
  trabajosRecientes: TrabajoReciente[];
}

export interface PayloadRegistro {
  taller: { nombre: string; telefono?: string; correo?: string; direccion?: string };
  usuario: {
    nombre: string;
    apellidos: string;
    correo: string;
    password: string;
    telefono?: string;
  };
}

export interface PayloadCrearUsuario {
  nombre: string;
  apellidos: string;
  correo: string;
  password: string;
  telefono?: string;
  rol: Rol;
}

export interface PayloadActualizarUsuario {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  rol?: Rol;
  activo?: boolean;
}
