const cacheName = 'stocktok-1012';
const staticAssets = [];

self.addEventListener('install', async event => {
  
    var cacheAllowlist = ['stocktok-1012'];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );

    const cache = await caches.open(cacheName); 
    await cache.addAll(staticAssets); 
});
self.addEventListener('fetch', event => {
		
    const req = event.request;

    if (/.*(json)$/.test(req.url)) {
        event.respondWith(networkFirst(req));
    } else {
        event.respondWith(cacheFirst(req));
    }
});

async function cacheFirst(req) {
  
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(req);
    return cachedResponse || networkFirst(req);
    
}
async function networkFirst(req) {
	
    const cache = await caches.open(cacheName);
    try { 
        const fresh = await fetch(req);
        if (req.method!=="POST" && req.method!=="PUT" && req.method!=="DELETE" && req.destination !== 'audio'){
            cache.put(req, fresh.clone());
        }    
        return fresh;
    } catch (e) { 
        const cachedResponse = await cache.match(req);
        return cachedResponse;
    }
}
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return true;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});