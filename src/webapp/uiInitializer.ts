/**
 * UI Initializer
 *
 * This script handles the transition between static and dynamic content
 * for the eDoc Viewer application.
 */

// Track initialization status
let initialized = false;

/**
 * Initialize the UI by hiding static content and showing the web components
 */
export function initializeUI(): void {
  if (initialized) return;

  console.log("Initializing UI...");

  // Get elements
  const staticContent = document.getElementById("static-content");
  const appElement = document.getElementById("app");

  // Make sure elements exist
  if (!staticContent || !appElement) {
    console.error("Could not find required elements: static-content or app");
    return;
  }

  try {
    // Hide static content
    staticContent.style.display = "none";

    // Show app
    appElement.style.display = "block";

    // Add class to root element for CSS targeting
    document.documentElement.classList.add("js-loaded");

    initialized = true;
    console.log("UI initialized successfully");
  } catch (error) {
    console.error("Error initializing UI:", error);
  }
}

/**
 * Register event listeners for initialization
 */
export function setupInitializers(): void {
  // Define the expected event types
  type ComponentEvent = CustomEvent<unknown>;

  // Initialize when the component is connected
  window.addEventListener("edoc-app-connected", () => {
    console.log("Component connected event detected");
    setTimeout(initializeUI, 10);
  });

  // Initialize when the component is rendered
  window.addEventListener("edoc-app-rendered", () => {
    console.log("Component rendered event detected");
    initializeUI();
  });

  // Initialize when custom elements are defined
  if (customElements.get("edoc-app")) {
    console.log("edoc-app is already defined");
    initializeUI();
  } else {
    customElements.whenDefined("edoc-app").then(() => {
      console.log("edoc-app has been defined");
      setTimeout(initializeUI, 50);
    });
  }

  // Fallback initialization
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (!initialized) {
        console.log("Fallback initialization (window load)");
        initializeUI();
      }
    }, 500);
  });

  // Mutation observer as an additional fallback
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (
            node instanceof Element &&
            node.nodeName.toLowerCase() === "edoc-app"
          ) {
            console.log("edoc-app element detected by mutation observer");
            setTimeout(initializeUI, 10);
            observer.disconnect();
            return;
          }
        }
      }
    }
  });

  // Start observing the document body for added nodes
  observer.observe(document.body, { childList: true, subtree: true });

  // Very last resort timeout
  setTimeout(() => {
    if (!initialized) {
      console.log("Last resort initialization timeout");
      initializeUI();
    }
  }, 3000);
}

// Export a direct initialization function for immediate use
export function ensureInitialized(): void {
  setupInitializers();

  // Try immediate initialization
  setTimeout(initializeUI, 0);
}
