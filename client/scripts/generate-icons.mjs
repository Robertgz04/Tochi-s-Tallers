/**
 * Genera los iconos PNG de la PWA (diseño original: hexágono + T).
 * Uso: node scripts/generate-icons.mjs
 * No depende de librerías externas (usa solo módulos nativos de Node).
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CARPETA = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const FONDO = [0x0b, 0x0d, 0x10, 255];
const AMBAR = [0xf5, 0x9e, 0x0b, 255];
const TEXTO = [0xf5, 0xf7, 0xfa, 255];

// ---- Codificador PNG mínimo ----
const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function fragmente(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

function crearPng(ancho, alto, pixeles) {
  const firma = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // tipo RGBA
  const bruto = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    bruto[y * (ancho * 4 + 1)] = 0; // filtro None
    pixeles.copy(bruto, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  return Buffer.concat([
    firma,
    fragmente('IHDR', ihdr),
    fragmente('IDAT', deflateSync(bruto, { level: 9 })),
    fragmente('IEND', Buffer.alloc(0)),
  ]);
}


// ---- Dibujo ----
function hexagono(cx, cy, radio) {
  const vertices = [];
  for (let i = 0; i < 6; i++) {
    const angulo = ((90 + i * 60) * Math.PI) / 180;
    vertices.push([cx + radio * Math.cos(angulo), cy - radio * Math.sin(angulo)]);
  }
  return vertices;
}

function dentroDePoligono(x, y, vertices) {
  let dentro = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [xi, yi] = vertices[i];
    const [xj, yj] = vertices[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

function pintarRect(pixeles, tam, color, x0, y0, x1, y1) {
  for (let y = Math.round(y0); y < Math.round(y1); y++) {
    for (let x = Math.round(x0); x < Math.round(x1); x++) {
      const i = (y * tam + x) * 4;
      pixeles[i] = color[0];
      pixeles[i + 1] = color[1];
      pixeles[i + 2] = color[2];
      pixeles[i + 3] = color[3];
    }
  }
}

function generarIcono(tam, { maskable = false } = {}) {
  const pixeles = Buffer.alloc(tam * tam * 4);
  pintarRect(pixeles, tam, FONDO, 0, 0, tam, tam);

  const escala = maskable ? 0.62 : 1;
  const cx = tam / 2;
  const cy = tam / 2;
  const exterior = hexagono(cx, cy, 0.45 * tam * escala);
  const interior = hexagono(cx, cy, 0.3 * tam * escala);

  const limite = Math.ceil(tam * escala);
  const inicio = Math.floor((tam - limite) / 2);
  for (let y = inicio; y < inicio + limite; y++) {
    for (let x = inicio; x < inicio + limite; x++) {
      if (dentroDePoligono(x + 0.5, y + 0.5, exterior)) {
        const i = (y * tam + x) * 4;
        const color = dentroDePoligono(x + 0.5, y + 0.5, interior) ? FONDO : AMBAR;
        pixeles[i] = color[0];
        pixeles[i + 1] = color[1];
        pixeles[i + 2] = color[2];
        pixeles[i + 3] = color[3];
      }
    }
  }

  // Tipografía "T" (proporciones del logo SVG)
  const s = tam * escala;
  pintarRect(pixeles, tam, TEXTO, cx - 0.175 * s, cy - 0.15 * s, cx + 0.175 * s, cy - 0.05 * s);
  pintarRect(pixeles, tam, TEXTO, cx - 0.055 * s, cy - 0.15 * s, cx + 0.055 * s, cy + 0.175 * s);

  return crearPng(tam, tam, pixeles);
}

mkdirSync(CARPETA, { recursive: true });
const archivos = [
  ['icon-192.png', generarIcono(192)],
  ['icon-512.png', generarIcono(512)],
  ['icon-512-maskable.png', generarIcono(512, { maskable: true })],
  ['apple-touch-icon.png', generarIcono(180)],
];
for (const [nombre, buffer] of archivos) {
  writeFileSync(join(CARPETA, nombre), buffer);
  console.log(`+ ${nombre}`);
}
console.log('Iconos generados en client/public/icons');
