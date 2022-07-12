const cacheName = 'stocktok-1001';
const staticAssets = [
    '/index.html',
    '/index.php'
];

self.addEventListener('install', async event => {
  
    var cacheAllowlist = ['stocktok-1001'];

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
        if (req.method!=="POST" && req.method!=="PUT" && req.method!=="DELETE"){
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
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                    return true;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});