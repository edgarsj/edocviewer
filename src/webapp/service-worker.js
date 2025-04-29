// Service Worker for eDoc Viewer PWA
const CACHE_NAME = "edoc-viewer-cache-v1";

// Assets to cache on install
const INITIAL_ASSETS = [
  "/",
  "/index.html",
  "/js/main.js", // This will be the main bundle
  "/css/main.css", // This will be the main CSS
  "/icons/edoc-icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install event - cache the initial assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching app shell");
      return cache.addAll(INITIAL_ASSETS);
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Clearing old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  // Ensure the service worker takes control of the page immediately
  return self.clients.claim();
});

// Fetch event - serve from cache first, then network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle file open requests for ASICE or EDOC files specially
  const url = new URL(event.request.url);
  if (url.searchParams.has("file")) {
    console.log(
      "Service Worker: Processing file parameter:",
      url.searchParams.get("file"),
    );
    // Let the main app handle this
    return;
  }

  // Standard cache-first strategy for assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          // Check if response is valid
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone();

          // Cache the fetched resource
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.log(
            "Service Worker: Fetch failed; returning offline page instead.",
            error,
          );
          // You could return a custom offline page here
        });
    }),
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
