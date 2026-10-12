import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const esquema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1).default('tochis_taller'),
  DB_USER: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().default(''),
  JWT_SECRET: z
    .string()
    .min(10, 'JWT_SECRET debe tener al menos 10 caracteres (copia .env.example a .env)'),
  JWT_EXPIRES_IN: z.string().min(1).default('12h'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  const errores = resultado.error.flatten().fieldErrors;
  console.error('Configuración inválida en .env:');
  for (const [campo, mensajes] of Object.entries(errores)) {
    console.error(`  - ${campo}: ${mensajes?.join(', ')}`);
  }
  process.exit(1);
}

export const env = resultado.data;
