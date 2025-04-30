import "./main.css";
import "../components/EdocApp";
import { setupFileHandling } from "./fileHandling";
import { configureShoelace } from "../utils/shoelace";
import { loadSavedLocale, setAppLocale } from "../localization/localization";
import { ensureInitialized } from "./uiInitializer";

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
    // Configure Shoelace assets path - MUST come before any component imports
    configureShoelace();

    // Initialize localization
    const savedLocale = loadSavedLocale();
    await setAppLocale(savedLocale);

    // Register service worker for PWA support
    registerServiceWorker();

    // Set up file handling (for PWA)
    setupFileHandling();

    // Initialize UI (hide static content, show web components)
    ensureInitialized();

    console.log("Application initialization complete");
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});

// Ensure the app is properly initialized even if the DOM content loaded event has already fired
if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  console.log("Document already loaded, ensuring initialization");
  ensureInitialized();
}
