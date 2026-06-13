/* RISHI Monitor — service worker (push + install) */
var CACHE = 'rishi-monitor-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

/* Web Push → show a notification even when the app is fully closed */
self.addEventListener('push', function(event) {
  var data = { title: 'RISHI Monitor', body: 'New activity', url: '/monitor.html', tag: 'rishi' };
  try {
    if (event.data) {
      var p = event.data.json();
      data.title = p.title || data.title;
      data.body  = p.body  || data.body;
      data.url   = p.url   || data.url;
      data.tag   = p.tag   || data.tag;
    }
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      renotify: true,
      icon: '/icons/fav-1.png?v=2',
      badge: '/icons/fav-1.png?v=2',
      vibrate: [120, 60, 120],
      data: { url: data.url }
    })
  );
});

/* Tapping the notification opens / focuses the Monitor */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/monitor.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('/monitor.html') !== -1 && 'focus' in list[i]) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
