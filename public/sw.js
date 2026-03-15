// Service Worker básico para cumplir con los requisitos de PWA (instalabilidad)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Solo pasamos las peticiones, no hacemos caché agresiva para evitar conflictos con el desarrollo
  event.respondWith(fetch(event.request));
});