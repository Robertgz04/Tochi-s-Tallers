import { z } from 'zod';
import { ROLES } from '../types/roles';

const password = z
  .string({ required_error: 'La contraseña es obligatoria.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña no puede exceder 72 caracteres.');

export const crearUsuarioSchema = z.object({
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
  correo: z
    .string({ required_error: 'El correo es obligatorio.' })
    .trim()
    .email('Ingresa un correo electrónico válido.')
    .max(160, 'El correo no puede exceder 160 caracteres.'),
  password,
  telefono: z.string().trim().max(30, 'Teléfono muy largo.').optional().or(z.literal('')),
  rol: z.enum(ROLES, {
    errorMap: () => ({ message: 'Selecciona un rol válido.' }),
  }),
});

export const actualizarUsuarioSchema = z
  .object({
    nombre: z.string().trim().min(2).max(80).optional(),
    apellidos: z.string().trim().min(2).max(80).optional(),
    telefono: z.string().trim().max(30).optional().or(z.literal('')),
    rol: z
      .enum(ROLES, { errorMap: () => ({ message: 'Selecciona un rol válido.' }) })
      .optional(),
    activo: z.boolean().optional(),
  })
  .refine(
    (datos) => Object.values(datos).some((valor) => valor !== undefined),
    'Envía al menos un campo para actualizar.',
  );

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
