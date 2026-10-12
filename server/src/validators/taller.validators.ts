import { z } from 'zod';

export const actualizarTallerSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre del taller es obligatorio.' })
    .trim()
    .min(2, 'El nombre del taller debe tener al menos 2 caracteres.')
    .max(120, 'El nombre del taller no puede exceder 120 caracteres.'),
  razonSocial: z.string().trim().max(160, 'Razón social muy larga.').optional().or(z.literal('')),
  logoUrl: z.string().trim().max(500, 'URL del logo muy larga.').optional().or(z.literal('')),
  telefono: z.string().trim().max(30, 'Teléfono muy largo.').optional().or(z.literal('')),
  whatsapp: z.string().trim().max(30, 'WhatsApp muy largo.').optional().or(z.literal('')),
  correo: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico válido.')
    .max(160)
    .optional()
    .or(z.literal('')),
  direccion: z.string().trim().max(240, 'Dirección muy larga.').optional().or(z.literal('')),
  ciudad: z.string().trim().max(80, 'Ciudad muy larga.').optional().or(z.literal('')),
  estado: z.string().trim().max(80, 'Estado muy largo.').optional().or(z.literal('')),
  codigoPostal: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/, 'El código postal debe tener entre 4 y 6 dígitos.')
    .optional()
    .or(z.literal('')),
  rfc: z
    .string()
    .trim()
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i, 'El RFC no tiene un formato válido.')
    .optional()
    .or(z.literal('')),
  moneda: z.string().trim().min(3, 'Moneda inválida.').max(10).optional(),
  zonaHoraria: z.string().trim().min(3, 'Zona horaria inválida.').max(64).optional(),
  iva: z
    .number({ invalid_type_error: 'El IVA debe ser un número.' })
    .min(0, 'El IVA no puede ser negativo.')
    .max(100, 'El IVA no puede superar el 100%.')
    .optional(),
  prefijoFolio: z
    .string({ required_error: 'El prefijo de folio es obligatorio.' })
    .trim()
    .min(1, 'El prefijo de folio no puede estar vacío.')
    .max(10, 'El prefijo de folio no puede exceder 10 caracteres.')
    .regex(/^[A-Za-z0-9-]+$/, 'El prefijo solo puede contener letras, números o guion.'),
});

export type ActualizarTallerInput = z.infer<typeof actualizarTallerSchema>;
