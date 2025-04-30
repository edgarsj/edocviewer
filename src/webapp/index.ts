import "./main.css";
import "../utils/shoelace";
import "../components/EdocApp";
import { setupFileHandling } from "./fileHandling";
import { loadSavedLocale, setAppLocale } from "../localization/localization";
import { ensureInitialized } from "./uiInitializer";
import { initializeLocaleIntegration } from "../utils/locale-integration";

// Register service worker for PWA functionality
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration =
        await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registered with scope:", registration.scope);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("App: Initializing...");

    // Initialize the locale integration system
    initializeLocaleIntegration();
    console.log("App: Locale integration initialized");

    // Initialize localization
    const savedLocale = loadSavedLocale();
    console.log(`App: Loaded saved locale preference: ${savedLocale}`);

    // Apply the saved locale
    await setAppLocale(savedLocale);
    console.log(`App: Initial locale set to ${savedLocale}`);

    // Register service worker for PWA support
    registerServiceWorker();
    console.log("App: Service worker registration initiated");

    // Set up file handling (for PWA)
    setupFileHandling();
    console.log("App: File handling set up");

    // Initialize UI (hide static content, show web components)
    ensureInitialized();
    console.log("App: UI initialization complete");

    // Set up debug event logging if in development mode
    if (process.env.NODE_ENV === "development") {
      setupDebugLogging();
    }

    console.log("App: Initialization complete");
  } catch (error) {
    console.error("App: Error initializing app:", error);
  }
});

// Setup debug event logging for development
function setupDebugLogging() {
  // Log locale change events
  window.addEventListener("localeChanged", (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log(
      "App Debug: localeChanged event on window:",
      customEvent.detail,
    );
  });

  // Log when components are defined
  customElements.whenDefined("edoc-app").then(() => {
    console.log("App Debug: edoc-app defined");
  });

  customElements.whenDefined("edoc-language-selector").then(() => {
    console.log("App Debug: edoc-language-selector defined");
  });
}

// Ensure the app is properly initialized even if the DOM content loaded event has already fired
if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  console.log("App: Document already loaded, ensuring initialization");
  // Initialize the locale integration system
  initializeLocaleIntegration();
  // Then continue with the rest of the initialization
  ensureInitialized();
}
