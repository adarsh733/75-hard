/* ==========================================
   75 HARD DUO - SERVICE WORKER & PUSH NOTIFICATIONS
   NETWORK-FIRST SERVING FOR LIVE CODE UPDATES
   ========================================== */

const CACHE_NAME = '75hard-duo-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/config.js',
  '/icon.png',
  '/apple-touch-icon.png',
  '/adarsh.jpg',
  '/sanjana.jpg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First for JS, CSS, and HTML files so code updates arrive instantly!
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (event.request.mode === 'navigate' || url.includes('/rest/v1/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Handle Push Events from Web Push Service Worker
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || '75 Hard Duo';
  const options = {
    body: data.body || 'New activity from your partner!',
    icon: data.icon || '/apple-touch-icon.png',
    badge: '/icon.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: '75hard_msg_' + Date.now(),
    renotify: true,
    requireInteraction: false,
    data: { url: '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle Notification Banner Taps (Opens app directly to screen)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
