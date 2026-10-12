import { api } from '@/lib/api';
import type { RespuestaOk, Taller } from '@/types';

export interface PayloadActualizarTaller {
  nombre: string;
  razonSocial?: string;
  logoUrl?: string;
  telefono?: string;
  whatsapp?: string;
  correo?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  rfc?: string;
  moneda?: string;
  zonaHoraria?: string;
  iva?: number;
  prefijoFolio?: string;
}

export const tallerService = {
  async obtenerMiTaller(): Promise<Taller> {
    const respuesta = await api.get<RespuestaOk<Taller>>('/talleres/mio');
    return respuesta.data.data;
  },

  async actualizarMiTaller(payload: PayloadActualizarTaller): Promise<Taller> {
    const respuesta = await api.put<RespuestaOk<Taller>>('/talleres/mio', payload);
    return respuesta.data.data;
  },
};
