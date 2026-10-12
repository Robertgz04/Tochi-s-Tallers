export interface DashboardData {
  stats: {
    ordenesActivas: number;
    vehiculosListos: number;
    cotizacionesPendientes: number;
    pagosPendientes: number;
    ingresosMes: number;
  };
  ingresosMensuales: { mes: string; total: number }[];
  ordenesPorEstado: { estado: string; cantidad: number }[];
  trabajosRecientes: TrabajoReciente[];
}

export interface TrabajoReciente {
  id: string;
  folio: string;
  estado: string;
  total: number;
  fechaIngreso: string;
  cliente: string;
  placa: string;
  vehiculo: string;
  mecanico: string | null;
}
