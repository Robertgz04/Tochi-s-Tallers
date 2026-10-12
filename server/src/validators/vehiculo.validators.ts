import { z } from 'zod';

export const COMBUSTIBLES = ['GASOLINA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GLP', 'GNC'] as const;
export const TRANSMISIONES = ['MANUAL', 'AUTOMATICA', 'CVT', 'OTRO'] as const;

export const crearVehiculoSchema = z.object({
  clienteId: z.string({ required_error: 'Selecciona el cliente dueño del vehículo.' })
    .uuid('Cliente inválido.'),
  placa: z
    .string({ required_error: 'La placa es obligatoria.' })
    .trim()
    .min(3, 'La placa debe tener al menos 3 caracteres.')
    .max(15, 'La placa no puede exceder 15 caracteres.'),
  vin: z.string().trim().max(20, 'VIN muy largo.').optional().or(z.literal('')),
  marca: z
    .string({ required_error: 'La marca es obligatoria.' })
    .trim()
    .min(2, 'La marca debe tener al menos 2 caracteres.')
    .max(60, 'La marca no puede exceder 60 caracteres.'),
  modelo: z
    .string({ required_error: 'El modelo es obligatorio.' })
    .trim()
    .min(1, 'El modelo es obligatorio.')
    .max(60, 'El modelo no puede exceder 60 caracteres.'),
  anio: z
    .coerce.number({ invalid_type_error: 'El año debe ser un número.' })
    .int('El año debe ser un número entero.')
    .min(1900, 'Año inválido.')
    .max(2100, 'Año inválido.')
    .optional()
    .nullable(),
  color: z.string().trim().max(40, 'Color muy largo.').optional().or(z.literal('')),
  motor: z.string().trim().max(60, 'Motor muy largo.').optional().or(z.literal('')),
  kilometraje: z
    .coerce.number({ invalid_type_error: 'El kilometraje debe ser un número.' })
    .min(0, 'El kilometraje no puede ser negativo.')
    .optional(),
  combustible: z.enum(COMBUSTIBLES, {
    errorMap: () => ({ message: 'Selecciona el tipo de combustible.' }),
  }).optional(),
  transmision: z
    .enum(TRANSMISIONES, { errorMap: () => ({ message: 'Transmisión inválida.' }) })
    .optional()
    .or(z.literal('')),
  notas: z.string().trim().max(2000, 'Las notas son muy largas.').optional().or(z.literal('')),
});

export const actualizarVehiculoSchema = crearVehiculoSchema
  .omit({ clienteId: true })
  .partial()
  .refine(
    (datos) => Object.values(datos).some((valor) => valor !== undefined),
    'Envía al menos un campo para actualizar.',
  );

export type CrearVehiculoInput = z.infer<typeof crearVehiculoSchema>;
export type ActualizarVehiculoInput = z.infer<typeof actualizarVehiculoSchema>;
