import { api } from '@/lib/api';
import type { CotizacionPublica, RespuestaOk } from '@/types';

/** Acceso público a una cotización por token (el cliente no necesita login). */
export const cotizacionPublicoService = {
  async obtener(token: string): Promise<CotizacionPublica> {
    const respuesta = await api.get<RespuestaOk<CotizacionPublica>>(`/publico/cotizaciones/${token}`);
    return respuesta.data.data;
  },
  async responder(token: string, aprobada: boolean): Promise<CotizacionPublica> {
    const respuesta = await api.post<RespuestaOk<CotizacionPublica>>(`/publico/cotizaciones/${token}/respuesta`, {
      aprobada,
    });
    return respuesta.data.data;
  },
};
