import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

// Auto-injected manifest
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

// Navigation fallback to index.html
registerRoute(
  ({ request }) => request.destination === "document", // HTML files
  new NetworkFirst({
    cacheName: "html-cache",
    networkTimeoutSeconds: 3, // Optional: Fallback faster if network is slow
  }),
);

// Special handling for root URL
self.addEventListener("fetch", (event) => {
  if (
    event.request.mode === "navigate" &&
    event.request.url === new URL("/", location).href
  ) {
    event.respondWith(caches.match("/index.html"));
  }
});
