import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

// Auto-injected manifest
precacheAndRoute(self.__WB_MANIFEST);

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
