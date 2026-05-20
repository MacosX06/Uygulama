const CACHE_NAME = 'bahce-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './ChatGPT Image 18 May 2026 22_12_27.png',
  './ChatGPT Image 18 May 2026 22_12_28.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        return fetch(event.request);
      })
  );
});
