import { api } from '@/lib/api';
import type {
  PayloadRegistro,
  RespuestaOk,
  SesionLogin,
  Usuario,
  ResultadoRegistro,
} from '@/types';

export const authService = {
  async login(correo: string, password: string): Promise<SesionLogin> {
    const respuesta = await api.post<RespuestaOk<SesionLogin>>('/auth/login', {
      correo,
      password,
    });
    return respuesta.data.data;
  },

  async registro(payload: PayloadRegistro): Promise<ResultadoRegistro> {
    const respuesta = await api.post<RespuestaOk<ResultadoRegistro>>('/auth/registro', payload);
    return respuesta.data.data;
  },

  async obtenerMe(): Promise<Usuario> {
    const respuesta = await api.get<RespuestaOk<Usuario>>('/auth/me');
    return respuesta.data.data;
  },

  async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<string> {
    const respuesta = await api.put<RespuestaOk<{ mensaje: string }>>('/auth/cambiar-password', {
      passwordActual,
      passwordNueva,
    });
    return respuesta.data.data.mensaje;
  },

  async solicitarRecuperacion(correo: string): Promise<{ mensaje: string; tokenPrueba?: string }> {
    const respuesta = await api.post<RespuestaOk<{ mensaje: string; tokenPrueba?: string }>>(
      '/auth/recuperar',
      { correo },
    );
    return respuesta.data.data;
  },

  async restablecerPassword(token: string, passwordNueva: string): Promise<string> {
    const respuesta = await api.post<RespuestaOk<{ mensaje: string }>>('/auth/restablecer', {
      token,
      passwordNueva,
    });
    return respuesta.data.data.mensaje;
  },
};
