/* Service worker of the locked EnglishPath app: keeps the app on the device so it opens with no connection.
   index.html carries the list of valid codes, so it is fetched fresh when there is a connection (a new or cancelled
   code takes effect) and served from the saved copy when there is none. The cache name changes with every build. */
const C = 'eptc-437d782343';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'logo.webp',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.startsWith('eptc-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  const f = u.pathname.split('/').pop();
  if (f === '' || f === 'index.html') {
    e.respondWith(fetch(r).then(x => { if (x.ok) { const y = x.clone(); caches.open(C).then(c => c.put('index.html', y)); } return x; })
      .catch(() => caches.match('index.html').then(x => x || Response.error())));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(x => x || fetch(r).then(y => {
    if (y.ok && /\/medals\/[a-z]+\.webp$/.test(u.pathname)) { const z = y.clone(); caches.open(C).then(c => c.put(r, z)); }
    return y; })));
});
