const CACHE_NAME = 'tareas-escolares-v2';

// No cacheamos nada por ahora para evitar problemas de despliegue
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar extensiones de Chrome y peticiones que no sean http/https
  if (!event.request.url.startsWith('http')) return;

  // No usar caché, ir directo a la red
  event.respondWith(fetch(event.request));
});
