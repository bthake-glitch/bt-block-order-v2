const CACHE = 'bt-block-order-v2-v8-6-update-solid';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function freshOrCache(request){
  const cache = await caches.open(CACHE);
  try{
    const fresh = await fetch(request, { cache: 'reload' });
    if(fresh && fresh.ok) await cache.put(request, fresh.clone());
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
  event.respondWith(freshOrCache(request));
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if(event.data && event.data.type === 'CLEAR_CACHES'){
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  }
});
