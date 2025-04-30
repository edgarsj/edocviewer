/**
 * Set up file handling for PWA
 */
export function setupFileHandling() {
  // Only use if the File Handling API is available
  if ("launchQueue" in window && "files" in LaunchParams.prototype) {
    // TypeScript may not recognize the launchQueue API yet
    // @ts-ignore
    window.launchQueue.setConsumer((launchParams: { files: any[] }) => {
      if (!launchParams.files || !launchParams.files.length) {
        return;
      }

      // Get the files from launch params
      const filePromises = launchParams.files.map((fileHandle: any) =>
        fileHandle.getFile(),
      );

      Promise.all(filePromises).then((files) => {
        // Pass to the app instance through a custom event
        const event = new CustomEvent("fileHandlingFiles", {
          detail: { files },
          bubbles: true,
        });
        window.dispatchEvent(event);
      });
    });
  }
}
