import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";

// Auto-injected manifest - precaches all static assets and HTML pages
precacheAndRoute(self.__WB_MANIFEST);

// Handle skip waiting message from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Claim clients immediately after activation
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first strategy for HTML pages (fresh content, fallback to cache)
// This ensures users get the latest content when online, but pages work offline
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages",
    networkTimeoutSeconds: 3,
  })
);

// Cache-first for scripts and styles (they're versioned with hash in filename)
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new CacheFirst({
    cacheName: "assets",
  })
);

// Cache-first for images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            return response;
          }
          return null;
        },
      },
    ],
  })
);
