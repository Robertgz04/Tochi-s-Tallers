import { api } from '@/lib/api';
import type {
  CotizacionResumen,
  EstadoCotizacion,
  ListadoCotizaciones,
  PayloadActualizarCotizacion,
  PayloadCrearCotizacion,
  RespuestaOk,
} from '@/types';

export interface ConteoCotizacion {
  estado: string;
  cantidad: number;
}

export const cotizacionService = {
  async listar(params: { pagina?: number; estado?: string; q?: string } = {}): Promise<ListadoCotizaciones> {
    const respuesta = await api.get<RespuestaOk<ListadoCotizaciones>>('/cotizaciones', {
      params: { pagina: params.pagina ?? 1, estado: params.estado, q: params.q },
    });
    return respuesta.data.data;
  },
  async estados(): Promise<ConteoCotizacion[]> {
    const respuesta = await api.get<RespuestaOk<ConteoCotizacion[]>>('/cotizaciones/estados');
    return respuesta.data.data;
  },
  async crear(payload: PayloadCrearCotizacion): Promise<CotizacionResumen> {
    const respuesta = await api.post<RespuestaOk<CotizacionResumen>>('/cotizaciones', payload);
    return respuesta.data.data;
  },
  async actualizar(id: string, payload: PayloadActualizarCotizacion): Promise<CotizacionResumen> {
    const respuesta = await api.patch<RespuestaOk<CotizacionResumen>>(`/cotizaciones/${id}`, payload);
    return respuesta.data.data;
  },
  async cambiarEstado(id: string, estado: EstadoCotizacion): Promise<CotizacionResumen> {
    const respuesta = await api.patch<RespuestaOk<CotizacionResumen>>(`/cotizaciones/${id}/estado`, { estado });
    return respuesta.data.data;
  },
};