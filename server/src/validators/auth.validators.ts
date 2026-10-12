import { z } from 'zod';

const correo = z
  .string({ required_error: 'El correo es obligatorio.' })
  .trim()
  .email('Ingresa un correo electrónico válido.')
  .max(160, 'El correo no puede exceder 160 caracteres.');

const password = z
  .string({ required_error: 'La contraseña es obligatoria.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña no puede exceder 72 caracteres.');

export const loginSchema = z.object({
  correo,
  password: z
    .string({ required_error: 'La contraseña es obligatoria.' })
    .min(1, 'Ingresa tu contraseña.'),
});

export const registroSchema = z.object({
  taller: z.object(
    {
      nombre: z
        .string({ required_error: 'El nombre del taller es obligatorio.' })
        .trim()
        .min(2, 'El nombre del taller debe tener al menos 2 caracteres.')
        .max(120, 'El nombre del taller no puede exceder 120 caracteres.'),
      telefono: z.string().trim().max(30, 'Teléfono muy largo.').optional(),
      correo: z
        .string()
        .trim()
        .email('Ingresa un correo electrónico válido.')
        .max(160)
        .optional()
        .or(z.literal('')),
      direccion: z.string().trim().max(240, 'Dirección muy larga.').optional(),
    },
    { required_error: 'Faltan los datos del taller.' },
  ),
  usuario: z.object(
    {
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
      correo,
      password,
      telefono: z.string().trim().max(30, 'Teléfono muy largo.').optional(),
    },
    { required_error: 'Faltan los datos del usuario.' },
  ),
});

export const cambiarPasswordSchema = z.object({
  passwordActual: z
    .string({ required_error: 'La contraseña actual es obligatoria.' })
    .min(1, 'Ingresa tu contraseña actual.'),
  passwordNueva: password,
});

export const recuperarPasswordSchema = z.object({
  correo,
});

export const restablecerPasswordSchema = z.object({
  token: z
    .string({ required_error: 'El token es obligatorio.' })
    .min(10, 'Token inválido.'),
  passwordNueva: password,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistroInput = z.infer<typeof registroSchema>;
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;
export type RecuperarPasswordInput = z.infer<typeof recuperarPasswordSchema>;
export type RestablecerPasswordInput = z.infer<typeof restablecerPasswordSchema>;
