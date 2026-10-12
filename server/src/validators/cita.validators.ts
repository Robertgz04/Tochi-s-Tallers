import { z } from 'zod';

export const ESTADOS_CITA = ['PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA'] as const;

const fechaHora = z
  .string({ required_error: 'La fecha es obligatoria.' })
  .min(1, 'La fecha es obligatoria.')
  .refine((valor) => !Number.isNaN(Date.parse(valor)), 'Fecha y hora inválidas.');

export const crearCitaSchema = z.object({
  clienteId: z.string().uuid('Cliente inválido.').optional().or(z.literal('')),
  vehiculoId: z.string().uuid('Vehículo inválido.').optional().or(z.literal('')),
  ordenId: z.string().uuid('Orden inválida.').optional().or(z.literal('')),
  titulo: z.string({ required_error: 'Ingresa el título.' }).trim().min(3, 'Ingresa el título.').max(160),
  descripcion: z.string().trim().max(2000).optional().or(z.literal('')),
  fechaInicio: fechaHora,
  fechaFin: fechaHora,
  todoElDia: z.boolean().optional(),
  estado: z.enum(ESTADOS_CITA).optional(),
  responsableId: z.string().uuid('Responsable inválido.').optional().or(z.literal('')),
});

export const actualizarCitaSchema = z
  .object({
    clienteId: z.string().uuid('Cliente inválido.').optional().or(z.literal('')),
    vehiculoId: z.string().uuid('Vehículo inválido.').optional().or(z.literal('')),
    titulo: z.string().trim().min(3).max(160).optional(),
    descripcion: z.string().trim().max(2000).optional().or(z.literal('')),
    fechaInicio: fechaHora.optional(),
    fechaFin: fechaHora.optional(),
    todoElDia: z.boolean().optional(),
    estado: z.enum(ESTADOS_CITA).optional(),
    responsableId: z.string().uuid('Responsable inválido.').optional().or(z.literal('')),
  })
  .refine((datos) => Object.values(datos).some((valor) => valor !== undefined), 'Envía al menos un campo.');

export const cambiarEstadoCitaSchema = z.object({
  estado: z.enum(ESTADOS_CITA, { errorMap: () => ({ message: 'Estado inválido.' }) }),
});

export type CrearCitaInput = z.infer<typeof crearCitaSchema>;
export type ActualizarCitaInput = z.infer<typeof actualizarCitaSchema>;
export type EstadoCita = (typeof ESTADOS_CITA)[number];
