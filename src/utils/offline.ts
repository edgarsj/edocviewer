/**
 * Utility for handling offline functionality
 */

import i18n from "./i18n";

export function setupOfflineDetection(): void {
  const offlineMessage = document.getElementById("offline-message");
  const closeOfflineMsg = document.getElementById("close-offline-msg");
  const offlineText = document.getElementById("offline-text");

  // Update translation if available
  if (offlineText) {
    offlineText.textContent =
      i18n.translate("offline.message") ||
      "You are currently offline. Some features may be limited.";
  }

  // Function to update offline status
  function updateOfflineStatus() {
    if (!navigator.onLine && offlineMessage) {
      offlineMessage.classList.remove("hidden");
    } else if (offlineMessage) {
      offlineMessage.classList.add("hidden");
    }
  }

  // Initial check
  updateOfflineStatus();

  // Add event listeners for online/offline events
  window.addEventListener("online", updateOfflineStatus);
  window.addEventListener("offline", updateOfflineStatus);

  // Setup close button for offline message
  if (closeOfflineMsg) {
    closeOfflineMsg.addEventListener("click", () => {
      if (offlineMessage) {
        offlineMessage.classList.add("hidden");
      }
    });
  }
}
