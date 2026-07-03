const CACHE = 'bt-block-order-v2-v8-2-update-fix';
const FILES = [
  './',
  './index.html',
  './styles.css',
  './blocks.js',
  './app.js', './summary.js', './jobs.js', './updates.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-yellow-192.png',
  './icon-yellow-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => key === CACHE ? null : caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request){
  const cache = await caches.open(CACHE);
  try{
    const fresh = await fetch(request, {cache:'no-store'});
    if(fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  }catch(err){
    const cached = await cache.match(request);
    if(cached) return cached;
    if(request.mode === 'navigate') return cache.match('./index.html');
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== location.origin) return;
  event.respondWith(networkFirst(request));
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
