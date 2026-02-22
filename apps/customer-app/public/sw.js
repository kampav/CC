const CACHE = 'cc-v1.3.0';
const ASSETS = [
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Always network-first for API calls and HTML navigation (index.html)
  if (url.pathname.startsWith('/api/') || e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        e.request.mode === 'navigate'
          ? caches.match('/index.html')
          : new Response('{"error":"offline"}', { headers: {'Content-Type':'application/json'} })
      )
    );
    return;
  }
  // Cache-first only for hashed static assets (JS, CSS, images)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          caches.open(CACHE).then(c => c.put(e.request, response.clone()));
        }
        return response;
      });
    })
  );
});
