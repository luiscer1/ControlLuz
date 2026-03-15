// Service Worker obligatorio para que Chrome permita la instalación
const CACHE_NAME = 'luz-control-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Respuesta mínima para cumplir con el criterio de instalabilidad de Chrome
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});