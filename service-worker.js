self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('url-detector-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/popup.js',
                '/background.js',
                '/malicious_urls.csv',
                '/blocked.html',
                '/images/anti.png',
                '/images/bug.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
