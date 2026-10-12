import { pool } from '../config/db';
import * as cotizacionRepo from '../repositories/cotizacion.repository';
import { ApiError } from '../utils/ApiError';
import type { EstadoCotizacion } from '../validators/cotizacion.validators';

export interface CotizacionPublica {
  folio: string;
  estado: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  observaciones: string | null;
  fechaCreacion: string;
  fechaEstimada: string | null;
  fechaAprobacion: string | null;
  puedeResponder: boolean;
  cliente: { nombre: string; telefono: string | null };
  vehiculo: { descripcion: string; placa: string; kilometraje: number | null };
  taller: {
    nombre: string;
    telefono: string | null;
    whatsapp: string | null;
    correo: string | null;
    logo: string | null;
    moneda: string;
  };
}

function aPublica(fila: cotizacionRepo.CotizacionPublicaFila): CotizacionPublica {
  return {
    folio: fila.folio,
    estado: fila.estado,
    subtotal: Number(fila.subtotal),
    impuestos: Number(fila.impuestos),
    descuento: Number(fila.descuento),
    total: Number(fila.total),
    observaciones: fila.observaciones,
    fechaCreacion: fila.fecha_creacion,
    fechaEstimada: fila.fecha_estimada,
    fechaAprobacion: fila.fecha_aprobacion,
    puedeResponder: fila.estado === 'ENVIADA',
    cliente: { nombre: fila.cliente_nombre, telefono: fila.cliente_telefono },
    vehiculo: {
      descripcion: fila.vehiculo_descripcion.trim(),
      placa: fila.placa,
      kilometraje: fila.vehiculo_kilometraje,
    },
    taller: {
      nombre: fila.taller_nombre,
      telefono: fila.taller_telefono,
      whatsapp: fila.taller_whatsapp,
      correo: fila.taller_correo,
      logo: fila.taller_logo,
      moneda: fila.taller_moneda,
    },
  };
}

export async function obtenerPublica(token: string): Promise<CotizacionPublica> {
  const fila = await cotizacionRepo.buscarPorTokenPublico(pool, token);
  if (!fila) throw ApiError.noEncontrado('Esta cotización no existe o el enlace no es válido.');
  return aPublica(fila);
}

export async function responderPublica(
  token: string,
  aprobada: boolean,
): Promise<CotizacionPublica> {
  const estado: EstadoCotizacion = aprobada ? 'APROBADA' : 'RECHAZADA';
  const existente = await cotizacionRepo.buscarPorTokenPublico(pool, token);
  if (!existente) throw ApiError.noEncontrado('Esta cotización no existe o el enlace no es válido.');
  if (existente.estado !== 'ENVIADA') {
    throw ApiError.conflicto('Esta cotización ya fue respondida anteriormente.');
  }
  const fila = await cotizacionRepo.responderPorToken(pool, token, estado);
  if (!fila) throw ApiError.conflicto('No se pudo registrar tu respuesta. Inténtalo de nuevo.');
  return aPublica(fila);
}
