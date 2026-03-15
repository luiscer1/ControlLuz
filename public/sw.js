// Service Worker mínimo para cumplir requisitos de PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // No cacheamos nada por ahora, solo necesitamos que el SW esté registrado
});