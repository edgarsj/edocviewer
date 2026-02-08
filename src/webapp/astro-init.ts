// src/webapp/astro-init.ts
import "./main.css";
import "../utils/shoelace";
import "../components/EdocApp";
import { setupFileHandling, isRunningAsPWA } from "./fileHandling";
import {
  loadSavedLocale,
  setAppLocale,
} from "../localization/localization";
import { ensureInitialized } from "./uiInitializer";
import { initializeLocaleIntegration } from "../utils/locale-integration";

import "../utils/docxPreloader";

// Global flag to prevent double initialization
let appInitialized = false;

// Register service worker for PWA functionality
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration =
        await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registered with scope:", registration.scope);

      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Received message from service worker:", event.data);
        if (event.data && event.data.type === "FILE_OPENED") {
          console.log(
            "Service worker notified of file opening:",
            event.data.url,
          );
        }
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
}

// Load Plausible Analytics only when not running as PWA
function loadPlausibleAnalytics() {
  // Skip loading analytics if running as PWA
  if (isRunningAsPWA()) {
    console.log("Running as PWA - skipping analytics loading");
    return;
  }

  console.log("Loading Plausible Analytics for web version");

  // Create and append the Plausible script to the document head
  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = "edocviewer.app";
  script.src = "https://n.zenomy.tech/js/script.js";

  // Add to document head
  document.head.appendChild(script);
}

// Main initialization function for Astro multi-page setup
export async function initializeEdocApp() {
  // Prevent double initialization
  if (appInitialized) {
    console.log("App already initialized, skipping");
    return;
  }

  appInitialized = true;
  console.log("Astro App: Initializing...");

  try {
    // STEP 1: Get page context from window globals (set by BaseLayout.astro)
    const pageLocale = (window as any).__EDOC_PAGE_LOCALE__ || 'en';
    const defaultViewerLocale = (window as any).__EDOC_VIEWER_LOCALE__ || 'en';
    const pageType = (window as any).__EDOC_PAGE_TYPE__ || 'main';

    console.log(`Astro App: Page context - locale: ${pageLocale}, viewer: ${defaultViewerLocale}, type: ${pageType}`);
    console.log(`Astro App: Running as PWA: ${isRunningAsPWA()}`);

    // STEP 2: Load analytics (skip if PWA)
    loadPlausibleAnalytics();
    console.log("Astro App: Analytics setup complete");

    // STEP 3: Initialize UI
    ensureInitialized();
    console.log("Astro App: UI initialization complete");

    // STEP 4: Set up file handling with page type
    setupFileHandling(pageType);
    console.log(`Astro App: File handling set up for page type: ${pageType}`);

    // STEP 5: Register service worker
    registerServiceWorker();
    console.log("Astro App: Service worker registration initiated");

    // STEP 6: Initialize localization
    await initializeLocalization(defaultViewerLocale);

    console.log("Astro App: Initialization complete");
  } catch (error) {
    console.error("Astro App: Error initializing app:", error);
  }
}

// Separate function to handle locale initialization
async function initializeLocalization(defaultViewerLocale: string) {
  try {
    // Get saved language preference (user's choice overrides page default)
    const savedLocale = loadSavedLocale();
    const viewerLocale = savedLocale || defaultViewerLocale;

    console.log(`Astro App: Default viewer locale: ${defaultViewerLocale}`);
    console.log(`Astro App: Saved locale preference: ${savedLocale || 'none'}`);
    console.log(`Astro App: Using viewer locale: ${viewerLocale}`);

    // Initialize the locale integration system
    initializeLocaleIntegration();
    console.log("Astro App: Locale integration initialized");

    // Wait for components to be ready
    await Promise.all([
      customElements.whenDefined("edoc-app"),
      customElements.whenDefined("edoc-language-selector"),
    ]).catch((err) => {
      console.warn("Waiting for custom elements failed:", err);
      console.log("Continuing with locale initialization anyway");
    });

    // Apply locale through the full system
    await setAppLocale(viewerLocale);
    console.log(`Astro App: Viewer locale set to ${viewerLocale}`);
  } catch (error) {
    console.error("Error initializing localization:", error);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEdocApp);
} else {
  // Document already loaded, initialize immediately
  initializeEdocApp();
}
