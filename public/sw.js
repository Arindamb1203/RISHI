/* RISHI Service Worker */
var CACHE = 'rishi-parent-v1';
var PRECACHE = ['/parent.html', '/parent-dashboard.html', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(PRECACHE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  /* Always go network-first for API calls */
  if (e.request.url.includes('/d1-sync') || e.request.url.includes('/tts')) return;
  e.respondWith(
    fetch(e.request).catch(function() { return caches.match(e.request); })
  );
});
