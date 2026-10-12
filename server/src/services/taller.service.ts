import { pool } from '../config/db';
import * as tallerRepo from '../repositories/taller.repository';
import type { Taller } from '../types/taller';
import { ApiError } from '../utils/ApiError';
import { aTaller } from '../utils/mappers';
import type { ActualizarTallerInput } from '../validators/taller.validators';

export async function obtenerMiTaller(tallerId: string): Promise<Taller> {
  const fila = await tallerRepo.buscarTallerPorId(pool, tallerId);
  if (!fila) {
    throw ApiError.noEncontrado('Taller no encontrado.');
  }
  return aTaller(fila);
}

export async function actualizarMiTaller(
  tallerId: string,
  datos: ActualizarTallerInput,
): Promise<Taller> {
  const campos: tallerRepo.CamposTaller = {
    nombre: datos.nombre,
    razon_social: datos.razonSocial ?? undefined,
    logo_url: datos.logoUrl ?? undefined,
    telefono: datos.telefono ?? undefined,
    whatsapp: datos.whatsapp ?? undefined,
    correo: datos.correo ?? undefined,
    direccion: datos.direccion ?? undefined,
    ciudad: datos.ciudad ?? undefined,
    estado: datos.estado ?? undefined,
    codigo_postal: datos.codigoPostal ?? undefined,
    rfc: datos.rfc ?? undefined,
    moneda: datos.moneda ?? undefined,
    zona_horaria: datos.zonaHoraria ?? undefined,
    iva: datos.iva ?? undefined,
    prefijo_folio: datos.prefijoFolio ?? undefined,
  };

  const fila = await tallerRepo.actualizarTaller(pool, tallerId, campos);
  if (!fila) {
    throw ApiError.noEncontrado('Taller no encontrado.');
  }
  return aTaller(fila);
}
