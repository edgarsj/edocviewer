/**
 * Universal download function that works in both regular browser and extension contexts
 * @param filename The name to save the file as
 * @param content The file content as Blob, Uint8Array, or ArrayBuffer
 * @param options Additional options
 * @returns Promise resolving to boolean indicating success
 */
export function downloadFile(
  filename: string,
  content: Blob | Uint8Array | ArrayBuffer,
  options: { saveAs?: boolean; mimeType?: string } = {},
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Default options
    const { saveAs = true, mimeType = "application/octet-stream" } = options;

    // Ensure content is a Blob
    const blob =
      content instanceof Blob
        ? content
        : new Blob([content], { type: mimeType });

    // Create URL for the blob
    const url = URL.createObjectURL(blob);

    // Try to use Chrome's Downloads API if available (for extension)
    if (
      typeof chrome !== "undefined" &&
      chrome.downloads &&
      chrome.downloads.download
    ) {
      chrome.downloads.download(
        {
          url: url,
          filename: filename,
          saveAs: saveAs,
        },
        (downloadId) => {
          // Clean up the blob URL
          URL.revokeObjectURL(url);

          if (chrome.runtime.lastError) {
            console.error("Download error:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve(true);
          }
        },
      );
    } else {
      // Fall back to HTML5 download for browser
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        // Some browsers require the element to be in the DOM
        document.body.appendChild(a);

        // Trigger the download
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        resolve(true);
      } catch (err) {
        console.error("Download error:", err);
        URL.revokeObjectURL(url);
        reject(err);
      }
    }
  });
}

/**
 * Derive a filename from various sources
 * @param originalUrl URL the file came from, if any
 * @param suggestedFilename Suggested filename, if any
 * @param defaultName Default filename if no other source is available
 * @returns The derived filename
 */
export function deriveFilename(
  originalUrl?: string,
  suggestedFilename?: string,
  defaultName: string = "document.edoc",
): string {
  if (suggestedFilename) {
    return suggestedFilename;
  }

  if (originalUrl) {
    const urlFilename = originalUrl.split("/").pop();
    if (urlFilename) {
      return urlFilename;
    }
  }

  return defaultName;
}
