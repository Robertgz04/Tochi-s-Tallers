import { z } from 'zod';

export const ETAPAS_EVIDENCIA = ['ANTES', 'DIAGNOSTICO', 'DURANTE', 'DESPUES'] as const;

export const subirEvidenciaSchema = z.object({
  etapa: z.enum(ETAPAS_EVIDENCIA, {
    errorMap: () => ({ message: 'Etapa inválida. Usa ANTES, DIAGNOSTICO, DURANTE o DESPUES.' }),
  }),
  descripcion: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar 500 caracteres.')
    .optional()
    .or(z.literal('')),
});

export type SubirEvidenciaInput = z.infer<typeof subirEvidenciaSchema>;
