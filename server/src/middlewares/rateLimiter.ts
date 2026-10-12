import rateLimit from 'express-rate-limit';

/** Límite de intentos para endpoints de autenticación (login, registro, recuperación). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos. Vuelve a intentarlo en unos minutos.',
  },
});
