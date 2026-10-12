import { api } from '@/lib/api';
import type { DashboardData, RespuestaOk } from '@/types';

export const dashboardService = {
  async obtener(): Promise<DashboardData> {
    const respuesta = await api.get<RespuestaOk<DashboardData>>('/reportes/dashboard');
    return respuesta.data.data;
  },
};
