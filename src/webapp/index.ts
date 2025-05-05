// src/webapp/index.ts
import "./main.css";
import "../utils/shoelace";
import "../components/EdocApp";
import { setupFileHandling, isRunningAsPWA } from "./fileHandling";
import {
  loadSavedLocale,
  setAppLocale,
  setLocale,
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
  script.src = "https://stats.zenomy.tech/js/script.js";

  // Add to document head
  document.head.appendChild(script);
}

// Main initialization function - only runs once
async function initializeApp() {
  // Prevent double initialization
  if (appInitialized) {
    console.log("App already initialized, skipping");
    return;
  }

  appInitialized = true;
  console.log("App: Initializing...");
  console.log(`App running as PWA: ${isRunningAsPWA()}`);

  try {
    // STEP 1: Initial setup
    loadPlausibleAnalytics();
    console.log("App: Analytics setup complete");

    // Initialize UI
    ensureInitialized();
    console.log("App: UI initialization complete");

    // STEP 2: Set up file handling
    setupFileHandling();
    console.log("App: File handling set up");

    // STEP 3: Register service worker
    registerServiceWorker();
    console.log("App: Service worker registration initiated");

    // STEP 4: Initialize localization AFTER UI is ready
    // This ensures components exist before we try to update them
    await initializeLocalization();

    // STEP 5: Set up debug event logging if in development mode
    if (process.env.NODE_ENV === "development") {
      setupDebugLogging();
    }

    console.log("App: Initialization complete");
  } catch (error) {
    console.error("App: Error initializing app:", error);
  }
}

// Separate function to handle locale initialization
async function initializeLocalization() {
  try {
    // Get saved language preference
    const savedLocale = loadSavedLocale();
    console.log(`App: Loaded saved locale preference: ${savedLocale}`);

    // Set document language for visual consistency
    document.documentElement.lang = savedLocale;

    // Initialize the locale integration system
    initializeLocaleIntegration();
    console.log("App: Locale integration initialized");

    // Wait for components to be ready
    await Promise.all([
      customElements.whenDefined("edoc-app"),
      customElements.whenDefined("edoc-language-selector"),
    ]).catch((err) => {
      console.warn("Waiting for custom elements failed:", err);
      console.log("Continuing with locale initialization anyway");
    });

    // Apply locale through the full system (single time)
    await setAppLocale(savedLocale);
    console.log(`App: Locale set to ${savedLocale}`);
  } catch (error) {
    console.error("Error initializing localization:", error);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

// Also run initialization if document is already loaded
if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  console.log("Document already loaded, ensuring initialization");
  initializeApp();
}

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

  // Add logging for file handling events
  window.addEventListener("fileHandlingFiles", (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log("App Debug: fileHandlingFiles event:", customEvent.detail);
  });

  // Add logging for file-selected events
  document.addEventListener(
    "file-selected",
    (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("App Debug: file-selected event:", customEvent.detail);
    },
    { capture: true },
  );

  // Add logging for edoc-app events
  document.addEventListener("edoc-app-connected", () => {
    console.log("App Debug: edoc-app-connected event");
  });

  document.addEventListener("edoc-app-rendered", () => {
    console.log("App Debug: edoc-app-rendered event");
  });
}

// Make debugging functionality available globally
// This helps with troubleshooting PWA file handling issues
(window as any).debugEdoc = {
  testFileHandling: (fileUrl: string) => {
    console.log(`Debug: Testing file handling with URL ${fileUrl}`);

    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const filename = fileUrl.split("/").pop() || "test-file.edoc";
        const file = new File([blob], filename, {
          type: "application/octet-stream",
        });

        console.log(`Debug: File fetched, dispatching global event`);
        window.dispatchEvent(
          new CustomEvent("fileHandlingFiles", {
            detail: { files: [file] },
            bubbles: true,
          }),
        );

        return "File handling test initiated";
      })
      .catch((error) => {
        console.error("Debug: Error testing file handling:", error);
        return `Error: ${error.message}`;
      });
  },

  // Add a manual file handling tester that accepts a File object
  testFileWithObject: (file: File) => {
    console.log(`Debug: Testing file handling with File object: ${file.name}`);

    window.dispatchEvent(
      new CustomEvent("fileHandlingFiles", {
        detail: { files: [file] },
        bubbles: true,
      }),
    );

    return "File handling test initiated with File object";
  },

  // Check the PWA status and file handling support
  checkEnvironment: () => {
    const isPWA = isRunningAsPWA();
    const hasLaunchQueue = "launchQueue" in window;
    const hasLaunchParams =
      typeof LaunchParams !== "undefined" && "files" in LaunchParams.prototype;

    // Add Plausible status to environment check
    const hasPlausible = typeof (window as any).plausible === "function";

    return {
      isPWA,
      hasLaunchQueue,
      hasLaunchParams,
      serviceWorkerRegistered: "serviceWorker" in navigator,
      userAgent: navigator.userAgent,
      displayMode: window.matchMedia("(display-mode: standalone)").matches
        ? "standalone"
        : "browser",
      analytics: {
        plausibleLoaded: hasPlausible,
        shouldHaveAnalytics: !isPWA,
      },
    };
  },

  // Force the app to the result view (for testing)
  showResultView: () => {
    const edocApp = document.querySelector("edoc-app") as any;
    if (edocApp && edocApp.view) {
      edocApp.view = "result";
      return "Switched to result view";
    }
    return "Could not switch view - app not found or initialized";
  },

  // Force the app to the upload view (for testing)
  showUploadView: () => {
    const edocApp = document.querySelector("edoc-app") as any;
    if (edocApp && edocApp.view) {
      edocApp.view = "upload";
      return "Switched to upload view";
    }
    return "Could not switch view - app not found or initialized";
  },

  // Check if analytics are loaded
  checkAnalytics: () => {
    const isPWA = isRunningAsPWA();
    const hasPlausible = typeof (window as any).plausible === "function";

    return {
      isPWA,
      hasPlausible,
      correct: (isPWA && !hasPlausible) || (!isPWA && hasPlausible),
    };
  },

  // Add locale debugging tools
  localeDebug: {
    toggleLanguage: async () => {
      const currentLocale = document.documentElement.lang;
      const newLocale = currentLocale === "en" ? "lv" : "en";
      await setAppLocale(newLocale);
      return `Changed language from ${currentLocale} to ${newLocale}`;
    },
    forceLocale: async (locale) => {
      if (locale === "en" || locale === "lv") {
        await setAppLocale(locale);
        return `Set locale to ${locale}`;
      }
      return `Invalid locale: ${locale}. Use "en" or "lv"`;
    },
    reset: () => {
      try {
        localStorage.removeItem("edoc-viewer-lang");
        return "Cleared language preference from localStorage";
      } catch (e) {
        return `Error clearing localStorage: ${e}`;
      }
    },
  },
};
