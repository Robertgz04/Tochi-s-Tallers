import { api } from '@/lib/api';
import type { ListadoPagos, PagoResumen, PayloadCrearPago, RespuestaOk } from '@/types';

export const pagoService = {
  async listar(params: { pagina?: number; q?: string } = {}): Promise<ListadoPagos> {
    const respuesta = await api.get<RespuestaOk<ListadoPagos>>('/pagos', {
      params: { pagina: params.pagina ?? 1, q: params.q },
    });
    return respuesta.data.data;
  },
  async crear(payload: PayloadCrearPago): Promise<PagoResumen> {
    const respuesta = await api.post<RespuestaOk<PagoResumen>>('/pagos', payload);
    return respuesta.data.data;
  },
  async eliminar(id: string): Promise<void> {
    await api.delete<RespuestaOk<{ mensaje: string }>>(`/pagos/${id}`);
  },
};