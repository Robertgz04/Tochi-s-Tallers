import { z } from 'zod';
import { ESTADOS_ORDEN, NIVELES_COMBUSTIBLE } from '../types/orden';

const importe = z
  .coerce.number({ invalid_type_error: 'El importe debe ser un número.' })
  .min(0, 'El importe no puede ser negativo.');

export const crearOrdenSchema = z.object({
  clienteId: z
    .string({ required_error: 'Selecciona el cliente.' })
    .uuid('Cliente inválido.'),
  vehiculoId: z
    .string({ required_error: 'Selecciona el vehículo.' })
    .uuid('Vehículo inválido.'),
  mecanicoId: z.string().uuid('Mecánico inválido.').optional().or(z.literal('')),
  fechaEstimada: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (usa el formato AAAA-MM-DD).')
    .optional()
    .or(z.literal('')),
  kilometrajeEntrada: z
    .coerce.number({ invalid_type_error: 'El kilometraje debe ser un número.' })
    .min(0, 'El kilometraje no puede ser negativo.')
    .optional(),
  nivelCombustible: z
    .enum(NIVELES_COMBUSTIBLE, { errorMap: () => ({ message: 'Nivel de combustible inválido.' }) })
    .optional(),
  descripcionCliente: z
    .string({ required_error: 'Describe el motivo de la visita.' })
    .trim()
    .min(3, 'Describe brevemente el motivo de la visita.')
    .max(2000, 'La descripción es muy larga.'),
  diagnostico: z.string().trim().max(4000, 'El diagnóstico es muy largo.').optional().or(z.literal('')),
});

export const actualizarOrdenSchema = z
  .object({
    mecanicoId: z.string().uuid('Mecánico inválido.').optional().or(z.literal('')),
    fechaEstimada: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (usa el formato AAAA-MM-DD).')
      .optional()
      .or(z.literal('')),
    fechaFinalizacion: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (usa el formato AAAA-MM-DD).')
      .optional()
      .or(z.literal('')),
    nivelCombustible: z
      .enum(NIVELES_COMBUSTIBLE, { errorMap: () => ({ message: 'Nivel de combustible inválido.' }) })
      .optional(),
    descripcionCliente: z.string().trim().min(3).max(2000).optional(),
    diagnostico: z.string().trim().max(4000).optional().or(z.literal('')),
    observaciones: z.string().trim().max(4000).optional().or(z.literal('')),
    subtotal: importe.optional(),
    impuestos: importe.optional(),
    descuento: importe.optional(),
    total: importe.optional(),
  })
  .refine(
    (datos) => Object.values(datos).some((valor) => valor !== undefined),
    'Envía al menos un campo para actualizar.',
  );

export const cambiarEstadoSchema = z.object({
  estado: z.enum(ESTADOS_ORDEN, {
    errorMap: () => ({ message: 'Estado inválido.' }),
  }),
});

export type CrearOrdenInput = z.infer<typeof crearOrdenSchema>;
export type ActualizarOrdenInput = z.infer<typeof actualizarOrdenSchema>;
