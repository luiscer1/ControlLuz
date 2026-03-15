
// Service Worker básico para permitir la instalación en dispositivos
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estrategia de red solamente para evitar problemas con la cache en desarrollo
  event.respondWith(fetch(event.request));
});
