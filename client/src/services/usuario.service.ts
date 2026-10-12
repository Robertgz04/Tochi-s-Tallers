import { api } from '@/lib/api';
import type { PayloadActualizarUsuario, PayloadCrearUsuario, RespuestaOk, Usuario } from '@/types';

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const respuesta = await api.get<RespuestaOk<Usuario[]>>('/usuarios');
    return respuesta.data.data;
  },

  async crear(payload: PayloadCrearUsuario): Promise<Usuario> {
    const respuesta = await api.post<RespuestaOk<Usuario>>('/usuarios', payload);
    return respuesta.data.data;
  },

  async actualizar(id: string, payload: PayloadActualizarUsuario): Promise<Usuario> {
    const respuesta = await api.patch<RespuestaOk<Usuario>>(`/usuarios/${id}`, payload);
    return respuesta.data.data;
  },
};
