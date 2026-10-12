import { ApiError } from './ApiError';

/**
 * Traduce errores de PostgreSQL (violaciones de constraint) a ApiError con
 * mensajes amigables. Cualquier otro error se relanza sin modificar.
 */
export function traducirErrorPg(error: unknown, mensajeConflicto?: string): never {
  const codigo = (error as { code?: string } | null)?.code;

  // 23505: unique violation.
  if (codigo === '23505' && mensajeConflicto) {
    throw ApiError.conflicto(mensajeConflicto);
  }
  // 23503: foreign key violation (registro referenciado en otra tabla).
  if (codigo === '23503') {
    throw ApiError.conflicto(
      'No se puede eliminar: este registro está vinculado a otros datos del taller.',
    );
  }
  throw error;
}
