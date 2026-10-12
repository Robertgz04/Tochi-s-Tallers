import { api } from '@/lib/api';
import type {
  Cliente,
  PayloadActualizarCliente,
  PayloadCrearCliente,
  RespuestaOk,
} from '@/types';

export const clienteService = {
  async listar(busqueda?: string): Promise<Cliente[]> {
    const respuesta = await api.get<RespuestaOk<Cliente[]>>('/clientes', {
      params: busqueda ? { q: busqueda } : undefined,
    });
    return respuesta.data.data;
  },

  async crear(payload: PayloadCrearCliente): Promise<Cliente> {
    const respuesta = await api.post<RespuestaOk<Cliente>>('/clientes', payload);
    return respuesta.data.data;
  },

  async actualizar(id: string, payload: PayloadActualizarCliente): Promise<Cliente> {
    const respuesta = await api.patch<RespuestaOk<Cliente>>(`/clientes/${id}`, payload);
    return respuesta.data.data;
  },

  async eliminar(id: string): Promise<void> {
    await api.delete<RespuestaOk<{ mensaje: string }>>(`/clientes/${id}`);
  },
};
