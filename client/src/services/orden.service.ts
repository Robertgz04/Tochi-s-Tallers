import { api } from '@/lib/api';
import type {
  ConteoEstado,
  EstadoOrden,
  ListadoOrdenes,
  OrdenDetalle,
  PayloadActualizarOrden,
  PayloadCrearOrden,
  RespuestaOk,
} from '@/types';

export const ordenService = {
  async listar(
    params: { pagina?: number; estado?: string; q?: string } = {},
  ): Promise<ListadoOrdenes> {
    const respuesta = await api.get<RespuestaOk<ListadoOrdenes>>('/ordenes', {
      params: { pagina: params.pagina ?? 1, estado: params.estado, q: params.q },
    });
    return respuesta.data.data;
  },

  async estados(): Promise<ConteoEstado[]> {
    const respuesta = await api.get<RespuestaOk<ConteoEstado[]>>('/ordenes/estados');
    return respuesta.data.data;
  },

  async obtener(id: string): Promise<OrdenDetalle> {
    const respuesta = await api.get<RespuestaOk<OrdenDetalle>>(`/ordenes/${id}`);
    return respuesta.data.data;
  },

  async crear(payload: PayloadCrearOrden): Promise<OrdenDetalle> {
    const respuesta = await api.post<RespuestaOk<OrdenDetalle>>('/ordenes', payload);
    return respuesta.data.data;
  },

  async actualizar(id: string, payload: PayloadActualizarOrden): Promise<OrdenDetalle> {
    const respuesta = await api.patch<RespuestaOk<OrdenDetalle>>(`/ordenes/${id}`, payload);
    return respuesta.data.data;
  },

  async cambiarEstado(id: string, estado: EstadoOrden): Promise<OrdenDetalle> {
    const respuesta = await api.patch<RespuestaOk<OrdenDetalle>>(`/ordenes/${id}/estado`, {
      estado,
    });
    return respuesta.data.data;
  },
};
