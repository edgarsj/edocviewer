// src/webapp/index.ts
import "./main.css";
import "../utils/shoelace";
import "../components/EdocApp";
import { setupFileHandling, isRunningAsPWA } from "./fileHandling";
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

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("App: Initializing...");
    console.log(`App running as PWA: ${isRunningAsPWA()}`);

    // Load analytics (only if not PWA)
    loadPlausibleAnalytics();
    console.log("App: Analytics setup complete");

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

    // Initialize UI (hide static content, show web components)
    ensureInitialized();
    console.log("App: UI initialization complete");

    // Set up file handling right away - it contains internal logic
    // to handle component availability
    setupFileHandling();
    console.log("App: File handling set up");

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

// Ensure the app is properly initialized even if the DOM content loaded event has already fired
if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  console.log("App: Document already loaded, ensuring initialization");
  // Load analytics
  loadPlausibleAnalytics();
  // Initialize the locale integration system
  initializeLocaleIntegration();
  // Then continue with the rest of the initialization
  ensureInitialized();
  // We handle file handling in the main initialization sequence now
  setupFileHandling();
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
};
