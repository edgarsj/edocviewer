// Service Worker for eDoc Viewer PWA
const CACHE_NAME = "edoc-viewer-cache-v1";
const SHOELACE_ASSETS_CACHE = "shoelace-assets-cache-v1";

// This line will be replaced by the Workbox plugin with the list of assets
// DO NOT modify this line or define self.__WB_MANIFEST anywhere else
const precacheManifest = self.__WB_MANIFEST || [];

// Install event - cache the initial assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching app shell");

      // Get URLs from the precache manifest
      const urlsToCache = precacheManifest
        ? precacheManifest.map((entry) => entry.url || entry)
        : ["/", "/index.html"];

      // Use Promise.all to catch and handle individual cache failures
      return Promise.all(
        urlsToCache.map((url) =>
          cache.add(url).catch((error) => {
            console.log(`Failed to cache ${url}:`, error);
          }),
        ),
      );
    }),
  );

  // Cache essential Shoelace assets
  event.waitUntil(
    caches.open(SHOELACE_ASSETS_CACHE).then((cache) => {
      return cache.add("/shoelace/assets/icons/system.svg").catch((error) => {
        console.log("Failed to cache Shoelace icon system:", error);
      });
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
          if (cacheName !== CACHE_NAME && cacheName !== SHOELACE_ASSETS_CACHE) {
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

  // Special handling for Shoelace assets (icons, etc.)
  if (event.request.url.includes("/shoelace/assets/")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Only cache valid responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }
          // Clone the response
          const responseToCache = response.clone();
          caches.open(SHOELACE_ASSETS_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      }),
    );
    return;
  }

  // Handle navigation requests differently - use a network-first strategy for HTML
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html");
      }),
    );
    return;
  }

  // For JS/CSS files with content hash in filename, use cache-first strategy
  if (event.request.url.match(/\.(js|css)$/)) {
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
            console.log("Service Worker: Fetch failed for JS/CSS:", error);
          });
      }),
    );
    return;
  }

  // Standard cache-first strategy for other assets
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
