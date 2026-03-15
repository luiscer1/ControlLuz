// Service Worker básico para cumplir requisitos de PWA (Instalación en Android)
const CACHE_NAME = 'luz-control-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estrategia: Network First con fallback a cache si fuera necesario
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
