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
