/**
 * Service Worker de Tochi'sTaller (FASE 1).
 *
 * Estrategia:
 *  - Precacheo de los archivos estáticos de la aplicación (lista inyectada
 *    por vite-plugin-pwa vía self.__WB_MANIFEST).
 *  - Navegaciones: red primero, con respaldo a la caché / shell offline.
 *  - Archivos estáticos: caché primero, actualización en segundo plano.
 *
 * Nota: este archivo se compila con Vite (esbuild) y queda fuera del typecheck
 * de `tsc -b` porque usa los tipos de ServiceWorkerGlobalScope.
 */

export {};

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const CACHE = 'tochistaller-v1';

const recursos: string[] = (self.__WB_MANIFEST ?? []).map((entrada) => entrada.url);

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(recursos))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((clave) => clave !== CACHE).map((clave) => caches.delete(clave))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);

  // Navegaciones (páginas): red primero, respaldo offline con el shell.
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          void caches.open(CACHE).then((cache) => cache.put(peticion, copia));
          return respuesta;
        })
        .catch(async () => {
          const cacheada = await caches.match(peticion);
          return cacheada ?? (await caches.match('/index.html')) ?? Response.error();
        }),
    );
    return;
  }

  // Mismos orígenes (JS, CSS, imágenes): caché primero con revalidación.
  if (url.origin === self.location.origin) {
    evento.respondWith(
      caches.match(peticion).then((cacheada) => {
        const red = fetch(peticion)
          .then((respuesta) => {
            if (respuesta.ok) {
              const copia = respuesta.clone();
              void caches.open(CACHE).then((cache) => cache.put(peticion, copia));
            }
            return respuesta;
          })
          .catch(() => cacheada ?? Response.error());
        return cacheada ?? red;
      }),
    );
  }
});
