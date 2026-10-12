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

export const NIVELES_COMBUSTIBLE = [
  'VACIO',
  'RESERVA',
  'CUARTO',
  'MITAD',
  'TRES_CUARTOS',
  'LLENO',
] as const;

export type NivelCombustible = (typeof NIVELES_COMBUSTIBLE)[number];

/** Cliente de un taller con el conteo de vehículos registrados. */
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