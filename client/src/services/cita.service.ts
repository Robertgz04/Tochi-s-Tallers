import { api } from '@/lib/api';
import type {
  Cita,
  EstadoCita,
  ListadoCitas,
  PayloadActualizarCita,
  PayloadCrearCita,
  RespuestaOk,
} from '@/types';

export const citaService = {
  async listar(params: { pagina?: number; q?: string; estado?: string; desde?: string; hasta?: string } = {}): Promise<ListadoCitas> {
    const respuesta = await api.get<RespuestaOk<ListadoCitas>>('/citas', {
      params: { pagina: params.pagina ?? 1, q: params.q, estado: params.estado, desde: params.desde, hasta: params.hasta },
    });
    return respuesta.data.data;
  },
  async crear(payload: PayloadCrearCita): Promise<Cita> {
    const respuesta = await api.post<RespuestaOk<Cita>>('/citas', payload);
    return respuesta.data.data;
  },
  async actualizar(id: string, payload: PayloadActualizarCita): Promise<Cita> {
    const respuesta = await api.patch<RespuestaOk<Cita>>(`/citas/${id}`, payload);
    return respuesta.data.data;
  },
  async cambiarEstado(id: string, estado: EstadoCita): Promise<Cita> {
    const respuesta = await api.patch<RespuestaOk<Cita>>(`/citas/${id}/estado`, { estado });
    return respuesta.data.data;
  },
  async eliminar(id: string): Promise<void> {
    await api.delete<RespuestaOk<{ mensaje: string }>>(`/citas/${id}`);
  },
};
