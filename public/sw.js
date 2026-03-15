
// Service Worker básico para permitir la instalabilidad PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estrategia de red primero para asegurar control local en tiempo real
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
