
self.addEventListener('install', function(event) {
    event.waitUntil(
    caches.open('cya-cache').then(function(cache) {
        return cache.addAll(
        [
            'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
            'https://code.jquery.com/jquery-2.2.3.min.js',
            'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js',
            '/css/main.css',
            '/js/cyapass.js',
            '/js/sha256.js',
            '/index.htm',
            '/cyapass.ico',
            '/cyapass.png'
        ]
        );
    })
    );
});

self.addEventListener('fetch', function(event) {
    console.log("fetching...");
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  