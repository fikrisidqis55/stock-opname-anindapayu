const CACHE = 'aninda-payu-static-v2';
const STATIC = ['/icons/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
    )).then(() => self.clients.claim()),
  );
});

// Network-first: refresh biasa selalu revalidasi chunk; cache hanya fallback saat offline.
// Cache-first sebelumnya menyebabkan chunk basi tertayang di dev ("module factory is not available").
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const cacheable = url.pathname.startsWith('/_next/static/') || STATIC.includes(url.pathname);
  if (!cacheable) return; // data & server actions selalu network
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(
          (cached) => cached ?? new Response('', { status: 504, statusText: 'Offline' }),
        ),
      ),
  );
});
