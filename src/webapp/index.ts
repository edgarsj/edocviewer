import "./main.css";
import "../components/EdocApp";
import { setupFileHandling } from "./fileHandling";
import { configureShoelace } from "../utils/shoelace";
import { loadSavedLocale, setAppLocale } from "../localization/localization";

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

    // Force hide the static content
    setTimeout(() => {
      // This delay helps ensure components are fully loaded
      document.documentElement.classList.add("js-loaded");
      console.log("Added js-loaded class to root element");

      // Extra safety - direct style manipulation
      const staticContent = document.getElementById("static-content");
      const appElement = document.getElementById("app");

      if (staticContent) {
        staticContent.style.display = "none";
        console.log("Hidden static content via direct style");
      }

      if (appElement) {
        appElement.style.display = "block";
        console.log("Shown app element via direct style");
      }
    }, 100);

    // Register service worker for PWA support
    registerServiceWorker();

    // Set up file handling (for PWA)
    setupFileHandling();
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});
