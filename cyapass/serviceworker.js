self.addEventListener('install', function(event) {
    event.waitUntil(
    caches.open('cya-cache').then(function(cache) {
        return cache.addAll(
        [
            'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
            'https://code.jquery.com/jquery-2.2.3.min.js',
            'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js',
            'css/main.css',
            'js/app.js',
            'js/cyapass.js',
            'js/sha256.js',
            'offline.htm',
            'cyapass.ico',
            'cyapass.png'

        ]
        );
    })
    );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("offline.htm");
        }
      });
    })
  );
});
  