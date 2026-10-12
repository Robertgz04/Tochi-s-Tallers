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

/* ============================================================
   Cotizaciones
   ============================================================ */

export const ESTADOS_COTIZACION = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'VENCIDA'] as const;
export type EstadoCotizacion = (typeof ESTADOS_COTIZACION)[number];

export const ETIQUETAS_COTIZACION: Record<EstadoCotizacion, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida',
};

export interface CotizacionResumen {
  id: string;
  folio: string;
  estado: EstadoCotizacion;
  clienteId: string;
  vehiculoId: string;
  ordenId: string | null;
  cliente: string;
  placa: string;
  vehiculo: string;
  ordenFolio: string | null;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  observaciones: string | null;
  tokenPublico: string | null;
  fechaAprobacion: string | null;
  fechaCreacion: string;
}

export interface ListadoCotizaciones {
  items: CotizacionResumen[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface PayloadCrearCotizacion {
  clienteId: string;
  vehiculoId: string;
  ordenId?: string;
  estado?: EstadoCotizacion;
  subtotal?: number;
  impuestos?: number;
  descuento?: number;
  total?: number;
  observaciones?: string;
}

export type PayloadActualizarCotizacion = Partial<Omit<PayloadCrearCotizacion, 'clienteId' | 'vehiculoId'>>;

/* ============================================================
   Pagos
   ============================================================ */

export const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'OTRO'] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export const ETIQUETAS_METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  MIXTO: 'Mixto',
  OTRO: 'Otro',
};

export interface PagoResumen {
  id: string;
  ordenId: string;
  clienteId: string;
  ordenFolio: string;
  cliente: string;
  vehiculo: string;
  placa: string;
  monto: number;
  metodoPago: MetodoPago;
  referencia: string | null;
  fechaPago: string;
  observaciones: string | null;
  ordenTotal: number;
  ordenPagado: number;
  saldo: number;
}

export interface ListadoPagos {
  items: PagoResumen[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface PayloadCrearPago {
  ordenId: string;
  monto: number;
  metodoPago: MetodoPago;
  referencia?: string;
  fechaPago?: string;
  observaciones?: string;
}

/* ============================================================
   Reportes
   ============================================================ */

export interface ResumenReportes {
  totales: {
    clientes: number;
    vehiculos: number;
    ordenes: number;
    ordenesEntregadas: number;
    facturado: number;
    cobrado: number;
    porCobrar: number;
    ingresosMes: number;
  };
  ingresosMensuales: { mes: string; total: number }[];
  ordenesPorMes: { mes: string; ordenes: number; facturado: number }[];
  ordenesPorEstado: { estado: EstadoOrden; cantidad: number }[];
  ingresosPorMetodo: { metodo: MetodoPago; monto: number; cantidad: number }[];
  topClientes: {
    clienteId: string;
    cliente: string;
    ordenes: number;
    facturado: number;
    pagado: number;
    saldo: number;
  }[];
  topMecanicos: { mecanicoId: string; mecanico: string; ordenes: number; facturado: number }[];
  cotizaciones: {
    total: number;
    enviadas: number;
    aprobadas: number;
    rechazadas: number;
    montoAprobado: number;
    montoEnviado: number;
  };
}

/* ============================================================
   Inventario
   ============================================================ */

export interface ItemInventario {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  unidad: string;
  costo: number;
  precio: number;
  stock: number;
  stockMinimo: number;
  ubicacion: string | null;
  activo: boolean;
  stockBajo: boolean;
  fechaCreacion: string;
}

export interface ListadoInventario {
  items: ItemInventario[];
  total: number;
  pagina: number;
  totalPaginas: number;
  stockBajoTotal: number;
  categorias: string[];
}

export const TIPOS_MOVIMIENTO = ['ENTRADA', 'SALIDA', 'AJUSTE'] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];

export const ETIQUETAS_MOVIMIENTO: Record<TipoMovimiento, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

export interface PayloadCrearItem {
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  unidad?: string;
  costo?: number;
  precio?: number;
  stock?: number;
  stockMinimo?: number;
  ubicacion?: string;
}

export type PayloadActualizarItem = Partial<PayloadCrearItem> & { activo?: boolean };

export interface PayloadMovimiento {
  itemId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string;
}

/* ============================================================
   Agenda (citas)
   ============================================================ */

export const ESTADOS_CITA = ['PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA'] as const;
export type EstadoCita = (typeof ESTADOS_CITA)[number];

export const ETIQUETAS_CITA: Record<EstadoCita, string> = {
  PROGRAMADA: 'Programada',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

export interface Cita {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  todoElDia: boolean;
  estado: EstadoCita;
  clienteId: string | null;
  cliente: string | null;
  vehiculoId: string | null;
  placa: string | null;
  ordenId: string | null;
  responsableId: string | null;
  responsable: string | null;
}

export interface ListadoCitas {
  items: Cita[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface PayloadCrearCita {
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
  clienteId?: string;
  vehiculoId?: string;
  responsableId?: string;
  todoElDia?: boolean;
  estado?: EstadoCita;
}

export type PayloadActualizarCita = Partial<PayloadCrearCita>;

/* ============================================================
   Cotización pública (cliente final, sin login)
   ============================================================ */

export interface CotizacionPublica {
  folio: string;
  estado: EstadoCotizacion;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  observaciones: string | null;
  fechaCreacion: string;
  fechaEstimada: string | null;
  fechaAprobacion: string | null;
  puedeResponder: boolean;
  cliente: { nombre: string; telefono: string | null };
  vehiculo: { descripcion: string; placa: string; kilometraje: number | null };
  taller: {
    nombre: string;
    telefono: string | null;
    whatsapp: string | null;
    correo: string | null;
    logo: string | null;
    moneda: string;
  };
}


