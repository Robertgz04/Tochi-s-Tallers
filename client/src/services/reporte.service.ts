import { api } from '@/lib/api';
import type { ResumenReportes, RespuestaOk } from '@/types';

export const reporteService = {
  async resumen(): Promise<ResumenReportes> {
    const respuesta = await api.get<RespuestaOk<ResumenReportes>>('/reportes/resumen');
    return respuesta.data.data;
  },
};
