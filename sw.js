const CACHE_NAME = 'mirror-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/manifest.json',
  '/media/icons/icon-192.png',
  '/media/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .catch(() => caches.match('/index.html'))
      )
  );
});
