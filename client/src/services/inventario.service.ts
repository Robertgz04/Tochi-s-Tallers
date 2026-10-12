import { api } from '@/lib/api';
import type {
  ItemInventario,
  ListadoInventario,
  PayloadActualizarItem,
  PayloadCrearItem,
  PayloadMovimiento,
  RespuestaOk,
} from '@/types';

export const inventarioService = {
  async listar(params: { pagina?: number; q?: string; categoria?: string; stockBajo?: boolean } = {}): Promise<ListadoInventario> {
    const respuesta = await api.get<RespuestaOk<ListadoInventario>>('/inventario', {
      params: {
        pagina: params.pagina ?? 1,
        q: params.q,
        categoria: params.categoria,
        stockBajo: params.stockBajo ? 'true' : undefined,
      },
    });
    return respuesta.data.data;
  },
  async crear(payload: PayloadCrearItem): Promise<ItemInventario> {
    const respuesta = await api.post<RespuestaOk<ItemInventario>>('/inventario', payload);
    return respuesta.data.data;
  },
  async actualizar(id: string, payload: PayloadActualizarItem): Promise<ItemInventario> {
    const respuesta = await api.patch<RespuestaOk<ItemInventario>>(`/inventario/${id}`, payload);
    return respuesta.data.data;
  },
  async eliminar(id: string): Promise<void> {
    await api.delete<RespuestaOk<{ mensaje: string }>>(`/inventario/${id}`);
  },
  async movimiento(payload: PayloadMovimiento): Promise<ItemInventario> {
    const respuesta = await api.post<RespuestaOk<ItemInventario>>('/inventario/movimientos', payload);
    return respuesta.data.data;
  },
};
