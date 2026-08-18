const CACHE_NAME = "spotify-glass-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/web-app.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching static assets");
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event (Cache-first with Network fallback)
self.addEventListener("fetch", (event) => {
  // Only handle local/same-origin fetches to avoid caching cross-origin CDN links (which are dynamic audio/image assets)
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          // Put fetched resource into cache
          if (networkResponse.status === 200 && event.request.method === "GET") {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Offline fallback
          if (event.request.url.includes("index.html") || event.request.url === self.location.origin + "/") {
            return caches.match("/index.html");
          }
        });
      })
    );
  }
});
