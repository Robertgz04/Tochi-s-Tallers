import { z } from 'zod';

const texto = z.string().trim().max(2000).optional().or(z.literal(''));

export const crearItemSchema = z.object({
  sku: z.string({ required_error: 'Ingresa el SKU.' }).trim().min(1, 'Ingresa el SKU.').max(40),
  nombre: z.string({ required_error: 'Ingresa el nombre.' }).trim().min(2, 'Ingresa el nombre.').max(120),
  descripcion: texto,
  categoria: z.string().trim().max(60).optional().or(z.literal('')),
  unidad: z.string().trim().max(20).optional().or(z.literal('')),
  costo: z.coerce.number().min(0, 'El costo no puede ser negativo.').optional(),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo.').optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.').optional(),
  stockMinimo: z.coerce.number().int().min(0, 'El stock mínimo no puede ser negativo.').optional(),
  ubicacion: z.string().trim().max(80).optional().or(z.literal('')),
});

export const actualizarItemSchema = z
  .object({
    sku: z.string().trim().min(1).max(40).optional(),
    nombre: z.string().trim().min(2).max(120).optional(),
    descripcion: texto,
    categoria: z.string().trim().max(60).optional().or(z.literal('')),
    unidad: z.string().trim().max(20).optional().or(z.literal('')),
    costo: z.coerce.number().min(0).optional(),
    precio: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    stockMinimo: z.coerce.number().int().min(0).optional(),
    ubicacion: z.string().trim().max(80).optional().or(z.literal('')),
    activo: z.boolean().optional(),
  })
  .refine((datos) => Object.values(datos).some((valor) => valor !== undefined), 'Envía al menos un campo.');

export const movimientoSchema = z.object({
  itemId: z.string({ required_error: 'Selecciona el producto.' }).uuid('Producto inválido.'),
  tipo: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE'], { errorMap: () => ({ message: 'Tipo de movimiento inválido.' }) }),
  cantidad: z.coerce.number({ invalid_type_error: 'La cantidad debe ser un número.' }).int().positive('La cantidad debe ser mayor a cero.'),
  motivo: z.string().trim().max(200).optional().or(z.literal('')),
});

export type CrearItemInput = z.infer<typeof crearItemSchema>;
export type ActualizarItemInput = z.infer<typeof actualizarItemSchema>;
export type MovimientoInput = z.infer<typeof movimientoSchema>;
