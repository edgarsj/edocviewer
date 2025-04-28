// Add export to make it a module
export {};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize language selector
  initLanguageSelector();

  // Setup button handlers
  setupButtons();
});

/**
 * Initialize the language selector
 */
function initLanguageSelector(): void {
  const languageSelect = document.getElementById(
    "language",
  ) as HTMLSelectElement;

  // Load saved preference from storage
  chrome.storage.local.get("language", (data) => {
    if (data.language) {
      languageSelect.value = data.language;
    }
  });

  // Save preference when changed
  languageSelect.addEventListener("change", () => {
    const selectedLanguage = languageSelect.value;
    chrome.storage.local.set({ language: selectedLanguage });
  });
}

/**
 * Setup button click handlers
 */
function setupButtons(): void {
  // Upload button
  const uploadButton = document.getElementById("upload-button");
  uploadButton?.addEventListener("click", (e) => {
    e.preventDefault();
    openFilePicker();
  });

  // Open viewer button
  const openViewerButton = document.getElementById("open-viewer");
  openViewerButton?.addEventListener("click", (e) => {
    e.preventDefault();
    openViewer();
  });
}

/**
 * Open a file picker dialog
 */
function openFilePicker(): void {
  // Create a temporary file input element
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".edoc,.asice";

  // Handle file selection
  fileInput.addEventListener("change", (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  });

  // Trigger the file picker
  fileInput.click();
}

/**
 * Handle selected file
 */
function handleFileSelection(file: File): void {
  const reader = new FileReader();

  reader.onload = (e) => {
    // Get file data as Uint8Array
    const arrayBuffer = e.target?.result as ArrayBuffer;
    const fileData = new Uint8Array(arrayBuffer);

    // Send message to background script to open the file
    chrome.runtime.sendMessage(
      {
        action: "open-edoc",
        fileData: Array.from(fileData), // Convert to array for message passing
        filename: file.name,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
        }

        // Close the popup
        window.close();
      },
    );
  };

  reader.onerror = () => {
    console.error("Error reading file");
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Open the viewer in a new tab
 */
function openViewer(): void {
  chrome.tabs.create({
    url: chrome.runtime.getURL("viewer.html"),
  });

  // Close the popup
  window.close();
}
