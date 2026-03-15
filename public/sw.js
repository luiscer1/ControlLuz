// Service Worker básico requerido para que Chrome habilite la instalación PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Solo passthrough para cumplir el requisito de PWA de Chrome
  event.respondWith(fetch(event.request));
});