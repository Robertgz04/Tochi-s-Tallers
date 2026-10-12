import { z } from 'zod';

export const ESTADOS_COTIZACION = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'VENCIDA'] as const;

const importe = z.coerce.number({ invalid_type_error: 'El importe debe ser un número.' }).min(0);

export const crearCotizacionSchema = z.object({
  clienteId: z.string({ required_error: 'Selecciona el cliente.' }).uuid('Cliente inválido.'),
  vehiculoId: z.string({ required_error: 'Selecciona el vehículo.' }).uuid('Vehículo inválido.'),
  ordenId: z.string().uuid('Orden inválida.').optional().or(z.literal('')),
  estado: z.enum(ESTADOS_COTIZACION).optional(),
  subtotal: importe.optional(),
  impuestos: importe.optional(),
  descuento: importe.optional(),
  total: importe.optional(),
  observaciones: z.string().trim().max(4000).optional().or(z.literal('')),
});

export const actualizarCotizacionSchema = z
  .object({
    ordenId: z.string().uuid('Orden inválida.').optional().or(z.literal('')),
    estado: z.enum(ESTADOS_COTIZACION).optional(),
    subtotal: importe.optional(),
    impuestos: importe.optional(),
    descuento: importe.optional(),
    total: importe.optional(),
    observaciones: z.string().trim().max(4000).optional().or(z.literal('')),
  })
  .refine((datos) => Object.values(datos).some((valor) => valor !== undefined), 'Envía al menos un campo.');

export const cambiarEstadoCotizacionSchema = z.object({
  estado: z.enum(ESTADOS_COTIZACION, { errorMap: () => ({ message: 'Estado inválido.' }) }),
});

export type CrearCotizacionInput = z.infer<typeof crearCotizacionSchema>;
export type ActualizarCotizacionInput = z.infer<typeof actualizarCotizacionSchema>;
export type EstadoCotizacion = (typeof ESTADOS_COTIZACION)[number];