// Service Worker básico para cumplir con los requisitos de PWA de Chrome
const CACHE_NAME = 'luz-control-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estrategia básica de red para asegurar que el contenido siempre esté actualizado
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
