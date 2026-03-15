// Service Worker básico requerido por Chrome para permitir la instalación (PWA)
const CACHE_NAME = 'luz-control-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Chrome requiere un listener de fetch para habilitar "Añadir a pantalla de inicio"
self.addEventListener('fetch', (event) => {
  // Estrategia básica: red primero, si falla nada (para control local)
  event.respondWith(fetch(event.request).catch(() => {
    return caches.match(event.request);
  }));
});