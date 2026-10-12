import { api } from '@/lib/api';
import type {
  PayloadActualizarVehiculo,
  PayloadCrearVehiculo,
  RespuestaOk,
  Vehiculo,
} from '@/types';

export const vehiculoService = {
  async listar(params: { q?: string; clienteId?: string } = {}): Promise<Vehiculo[]> {
    const respuesta = await api.get<RespuestaOk<Vehiculo[]>>('/vehiculos', {
      params: Object.values(params).some(Boolean) ? params : undefined,
    });
    return respuesta.data.data;
  },

  async crear(payload: PayloadCrearVehiculo): Promise<Vehiculo> {
    const respuesta = await api.post<RespuestaOk<Vehiculo>>('/vehiculos', payload);
    return respuesta.data.data;
  },

  async actualizar(id: string, payload: PayloadActualizarVehiculo): Promise<Vehiculo> {
    const respuesta = await api.patch<RespuestaOk<Vehiculo>>(`/vehiculos/${id}`, payload);
    return respuesta.data.data;
  },

  async eliminar(id: string): Promise<void> {
    await api.delete<RespuestaOk<{ mensaje: string }>>(`/vehiculos/${id}`);
  },
};
