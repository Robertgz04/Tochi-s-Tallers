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

/* ============================================================
   Clientes
   ============================================================ */

export interface Cliente {
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  whatsapp: string | null;
  correo: string | null;
  direccion: string | null;
  notas: string | null;
  fechaRegistro: string;
  activo: boolean;
  vehiculos: number;
}

export interface PayloadCrearCliente {
  nombre: string;
  apellidos: string;
  telefono?: string;
  whatsapp?: string;
  correo?: string;
  direccion?: string;
  notas?: string;
}

export type PayloadActualizarCliente = Partial<PayloadCrearCliente> & { activo?: boolean };

/* ============================================================
   Vehículos
   ============================================================ */

export const COMBUSTIBLES = ['GASOLINA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GLP', 'GNC'] as const;
export type Combustible = (typeof COMBUSTIBLES)[number];

export const TRANSMISIONES = ['MANUAL', 'AUTOMATICA', 'CVT', 'OTRO'] as const;
export type Transmision = (typeof TRANSMISIONES)[number];

export const ETIQUETAS_COMBUSTIBLE: Record<Combustible, string> = {
  GASOLINA: 'Gasolina',
  DIESEL: 'Diésel',
  ELECTRICO: 'Eléctrico',
  HIBRIDO: 'Híbrido',
  GLP: 'GLP',
  GNC: 'GNC',
};

export const ETIQUETAS_TRANSMISION: Record<Transmision, string> = {
  MANUAL: 'Manual',
  AUTOMATICA: 'Automática',
  CVT: 'CVT',
  OTRO: 'Otro',
};

export interface Vehiculo {
  id: string;
  clienteId: string;
  clienteNombre: string;
  placa: string;
  vin: string | null;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  motor: string | null;
  kilometraje: number;
  combustible: Combustible;
  transmision: Transmision | null;
  notas: string | null;
  fotoUrl: string | null;
  fechaRegistro: string;
  ordenes: number;
}

export interface PayloadCrearVehiculo {
  clienteId: string;
  placa: string;
  vin?: string;
  marca: string;
  modelo: string;
  anio?: number | null;
  color?: string;
  motor?: string;
  kilometraje?: number;
  combustible?: Combustible;
  transmision?: Transmision | '';
  notas?: string;
}

export type PayloadActualizarVehiculo = Partial<Omit<PayloadCrearVehiculo, 'clienteId'>>;

/* ============================================================
   Órdenes de trabajo
   ============================================================ */

export interface OrdenResumen {
  id: string;
  folio: string;
  estado: EstadoOrden;
  fechaIngreso: string;
  fechaEstimada: string | null;
  fechaFinalizacion: string | null;
  cliente: string;
  placa: string;
  vehiculo: string;
  mecanico: string | null;
  total: number;
  kilometrajeEntrada: number;
}

export interface OrdenDetalle extends OrdenResumen {
  clienteId: string;
  vehiculoId: string;
  mecanicoId: string | null;
  nivelCombustible: NivelCombustible;
  descripcionCliente: string;
  diagnostico: string | null;
  observaciones: string | null;
  subtotal: number;
  impuestos: number;
  descuento: number;
  pagado: number;
}

export const NIVELES_COMBUSTIBLE = [
  'VACIO',
  'RESERVA',
  'CUARTO',
  'MITAD',
  'TRES_CUARTOS',
  'LLENO',
] as const;
export type NivelCombustible = (typeof NIVELES_COMBUSTIBLE)[number];

export const ETIQUETAS_NIVEL_COMBUSTIBLE: Record<NivelCombustible, string> = {
  VACIO: 'Vacío',
  RESERVA: 'Reserva',
  CUARTO: 'Cuarto',
  MITAD: 'Mitad',
  TRES_CUARTOS: 'Tres cuartos',
  LLENO: 'Lleno',
};

export interface ListadoOrdenes {
  items: OrdenResumen[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface ConteoEstado {
  estado: EstadoOrden;
  cantidad: number;
}

export interface PayloadCrearOrden {
  clienteId: string;
  vehiculoId: string;
  mecanicoId?: string;
  fechaEstimada?: string;
  kilometrajeEntrada?: number;
  nivelCombustible?: NivelCombustible;
  descripcionCliente: string;
  diagnostico?: string;
}

export interface PayloadActualizarOrden {
  mecanicoId?: string;
  fechaEstimada?: string;
  fechaFinalizacion?: string;
  nivelCombustible?: NivelCombustible;
  descripcionCliente?: string;
  diagnostico?: string;
  observaciones?: string;
  subtotal?: number;
  impuestos?: number;
  descuento?: number;
  total?: number;
}
