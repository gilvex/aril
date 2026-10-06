// Cache only the public offline screen. Documents, sessions, streams and editor
// bundles always use the network so a PWA cannot replay an outdated studio.
const offlineCache = 'pomegranate-offline-v1'
const offlineFiles = ['/offline.html', '/offline.js', '/mark.svg']
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(offlineCache).then((cache) => cache.addAll(offlineFiles)))
})
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.startsWith('pomegranate-offline-') && name !== offlineCache)
      .map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      url.pathname === '/api' || url.pathname.startsWith('/api/')) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match('/offline.html', { cacheName: offlineCache })) || Response.error()))
  } else if (offlineFiles.includes(url.pathname)) {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match(url.pathname, { cacheName: offlineCache })) || Response.error()))
  }
})
