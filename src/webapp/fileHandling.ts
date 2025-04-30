// src/webapp/fileHandling.ts
/**
 * Set up file handling for PWA
 * This implementation works for both direct OS file handling and file URL parameters
 */
export function setupFileHandling() {
  // Log file handling environment
  console.log("Setting up file handling...");
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone ||
    document.referrer.includes("android-app://");
  console.log(`Running as PWA: ${isPWA}`);

  // Parse URL parameters first - this works regardless of PWA status
  handleUrlParameters();

  // Only use if the File Handling API is available (in PWA context)
  if ("launchQueue" in window && "files" in LaunchParams.prototype) {
    console.log("File Handling API available, setting up consumer");

    try {
      // TypeScript may not recognize the launchQueue API yet
      // @ts-ignore
      window.launchQueue.setConsumer((launchParams) => {
        console.log("File handling: Launch params received", launchParams);

        if (!launchParams.files || !launchParams.files.length) {
          console.log("File handling: No files in launch params");
          return;
        }

        // Get the files from launch params
        console.log(
          `File handling: Processing ${launchParams.files.length} files`,
        );
        const filePromises = launchParams.files.map((fileHandle) =>
          fileHandle.getFile().catch((error) => {
            console.error("Error getting file from handle:", error);
            return null;
          }),
        );

        Promise.all(filePromises)
          .then((files) => {
            const validFiles = files.filter((file) => file !== null);
            if (validFiles.length === 0) {
              console.error(
                "File handling: No valid files obtained from handles",
              );
              return;
            }

            // Process the first valid file
            const file = validFiles[0];
            console.log(
              `File handling: Processing file "${file.name}" (${file.size} bytes)`,
            );

            // Wait for the component to be ready before dispatching
            waitForComponentAndProcessFile(file);
          })
          .catch((error) => {
            console.error("File handling: Error processing files", error);
          });
      });

      console.log("File Handling API consumer set up successfully");
    } catch (error) {
      console.error("Error setting up launchQueue consumer:", error);
    }
  } else {
    console.log("File Handling API not available in this browser/context");
  }

  // Set up event listener for manual file handling events
  window.addEventListener("fileHandlingFiles", (e) => {
    console.log("File handling: Received fileHandlingFiles event");
    const customEvent = e as CustomEvent;
    const files = customEvent.detail?.files;

    if (files && files.length > 0) {
      const file = files[0];
      console.log(`File handling: Processing file "${file.name}" from event`);
      waitForComponentAndProcessFile(file);
    } else {
      console.log("File handling: No files in event");
    }
  });
}

/**
 * Handle URL parameters - this works for both PWA and browser contexts
 */
function handleUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const fileUrl = urlParams.get("file");

  if (fileUrl) {
    console.log(`URL parameter detected: file=${fileUrl}`);

    // Try to fetch the file from the URL
    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        // Create a File object from the blob
        const filename = getFilenameFromUrl(fileUrl);
        const file = new File([blob], filename, {
          type: getFileTypeFromFilename(filename),
        });

        console.log(`File fetched from URL: ${filename} (${file.size} bytes)`);
        waitForComponentAndProcessFile(file);
      })
      .catch((error) => {
        console.error("Error fetching file from URL:", error);
      });
  }
}

/**
 * Extract filename from URL
 */
function getFilenameFromUrl(url: string): string {
  const parts = url.split("/");
  let filename = parts[parts.length - 1];

  // Remove query parameters if any
  if (filename.includes("?")) {
    filename = filename.split("?")[0];
  }

  return decodeURIComponent(filename) || "downloaded-file";
}

/**
 * Determine MIME type from filename
 */
function getFileTypeFromFilename(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "asice":
      return "application/vnd.etsi.asic-e+zip";
    case "edoc":
      return "application/octet-stream";
    case "pdf":
      return "application/pdf";
    case "xml":
      return "application/xml";
    default:
      return "application/octet-stream";
  }
}

/**
 * Wait for the edoc-app component to be available and process the file
 */
function waitForComponentAndProcessFile(file: File) {
  // Function to find the component and dispatch event
  const findComponentAndProcess = () => {
    const component = document.querySelector("edoc-app");

    if (component) {
      console.log("Found edoc-app component, dispatching file-selected event");

      const fileSelectedEvent = new CustomEvent("file-selected", {
        detail: { file },
        bubbles: true,
        composed: true,
      });

      try {
        component.dispatchEvent(fileSelectedEvent);
        console.log("file-selected event dispatched successfully");
      } catch (error) {
        console.error("Error dispatching file-selected event:", error);
      }

      return true;
    }

    console.log("edoc-app component not found yet");
    return false;
  };

  // Try immediately
  if (findComponentAndProcess()) {
    return;
  }

  // If not found, try with requestAnimationFrame for better timing
  requestAnimationFrame(() => {
    if (findComponentAndProcess()) {
      return;
    }

    // If still not found, set up a MutationObserver to watch for the component
    console.log("Setting up MutationObserver to watch for edoc-app");
    const observer = new MutationObserver((mutations, obs) => {
      if (findComponentAndProcess()) {
        obs.disconnect();
        console.log("MutationObserver disconnected after finding component");
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Safety timeout to disconnect the observer after 10 seconds
    setTimeout(() => {
      if (observer) {
        observer.disconnect();
        console.log("MutationObserver disconnected due to timeout");
      }
    }, 10000);
  });
}

/**
 * Check if the app is running as a PWA
 */
export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    !!window.navigator.standalone || // For iOS
    document.referrer.includes("android-app://")
  );
}
