import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError';

/** Carpeta donde se guardan las fotos subidas (server/uploads en dev). */
export const CARPETA_UPLOADS = path.resolve(process.cwd(), 'uploads');

const CARPETA_TEMPORAL = path.join(CARPETA_UPLOADS, 'tmp');

const EXTENSIONES_PERMITIDAS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']);
export const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10 MB

const almacenamiento = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Se guarda primero en tmp; el servicio la mueve a uploads/{tallerId}/{ordenId}/
    // una vez validada la orden. Así nunca quedan huérfanas por validación fallida.
    fs.mkdirSync(CARPETA_TEMPORAL, { recursive: true });
    cb(null, CARPETA_TEMPORAL);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const sufijo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sufijo}${extension}`);
  },
});

function filtroArchivo(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
    cb(new ApiError(400, 'Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF o HEIC).'));
    return;
  }
  if (!EXTENSIONES_PERMITIDAS.has(extension)) {
    cb(new ApiError(400, 'Extensión de imagen no permitida. Usa JPG, PNG, WEBP, GIF o HEIC.'));
    return;
  }
  cb(null, true);
}

export const subidaFoto = multer({
  storage: almacenamiento,
  limits: { fileSize: TAMANO_MAXIMO_BYTES, files: 1 },
  fileFilter: filtroArchivo,
});
