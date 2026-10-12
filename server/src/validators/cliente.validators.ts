import { z } from 'zod';

const telefono = z.string().trim().max(30, 'Teléfono muy largo.').optional().or(z.literal(''));

export const crearClienteSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(80, 'El nombre no puede exceder 80 caracteres.'),
  apellidos: z
    .string({ required_error: 'Los apellidos son obligatorios.' })
    .trim()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres.')
    .max(80, 'Los apellidos no pueden exceder 80 caracteres.'),
  telefono,
  whatsapp: telefono,
  correo: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico válido.')
    .max(160, 'El correo no puede exceder 160 caracteres.')
    .optional()
    .or(z.literal('')),
  direccion: z.string().trim().max(240, 'Dirección muy larga.').optional().or(z.literal('')),
  notas: z.string().trim().max(2000, 'Las notas son muy largas.').optional().or(z.literal('')),
});

export const actualizarClienteSchema = crearClienteSchema
  .partial()
  .extend({ activo: z.boolean().optional() })
  .refine(
    (datos) => Object.values(datos).some((valor) => valor !== undefined),
    'Envía al menos un campo para actualizar.',
  );

export type CrearClienteInput = z.infer<typeof crearClienteSchema>;
export type ActualizarClienteInput = z.infer<typeof actualizarClienteSchema>;
