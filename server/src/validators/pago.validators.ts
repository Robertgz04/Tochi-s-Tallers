import { z } from 'zod';

export const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'OTRO'] as const;

export const crearPagoSchema = z.object({
  ordenId: z.string({ required_error: 'Selecciona la orden.' }).uuid('Orden inválida.'),
  monto: z.coerce.number({ invalid_type_error: 'El monto debe ser un número.' }).positive('El monto debe ser mayor a cero.'),
  metodoPago: z.enum(METODOS_PAGO, { errorMap: () => ({ message: 'Método de pago inválido.' }) }),
  referencia: z.string().trim().max(80).optional().or(z.literal('')),
  fechaPago: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (usa el formato AAAA-MM-DD).')
    .optional()
    .or(z.literal('')),
  observaciones: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type CrearPagoInput = z.infer<typeof crearPagoSchema>;
export type MetodoPago = (typeof METODOS_PAGO)[number];