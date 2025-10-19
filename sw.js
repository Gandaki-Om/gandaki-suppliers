// ✅ Gandaki Suppliers Service Worker
const CACHE_NAME = "gandaki-suppliers-v4";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./assets/images/favicon/favicon.ico",
  "./assets/images/favicon/favicon-96x96.png",
  "./assets/images/favicon/favicon.svg",
  "./assets/images/favicon/apple-touch-icon.png"
];

// Install event - cache important assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch event - serve from cache if available
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Don't cache browser extensions or admin requests
  if (requestUrl.origin !== location.origin) return;

  // Bypass favicon caching (always fetch new)
  if (requestUrl.pathname.includes("favicon")) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, res.clone());
            return res;
          });
        })
      );
    })
  );
});
