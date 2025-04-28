// Add module declaration to make it a module
export {};

// Listen for file downloads
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  // Check if the file is an edoc or asice file
  if (
    item.filename.toLowerCase().endsWith(".edoc") ||
    item.filename.toLowerCase().endsWith(".asice")
  ) {
    console.log("eDoc file detected:", item.filename);

    // Store the download info so we can access it later
    chrome.storage.local.set({
      lastEdocDownload: {
        id: item.id,
        filename: item.filename,
        url: item.url,
        timestamp: Date.now(),
      },
    });

    // Let Chrome's normal download behavior continue
    suggest({ filename: item.filename });
  } else {
    // Not an edoc file, just continue normally
    suggest({ filename: item.filename });
  }
});

// Listen for file downloads to complete
chrome.downloads.onChanged.addListener(async (delta) => {
  if (delta.state && delta.state.current === "complete") {
    // Check if this is our tracked edoc download
    const data = await chrome.storage.local.get("lastEdocDownload");
    const downloadInfo = data.lastEdocDownload;

    if (downloadInfo && downloadInfo.id === delta.id) {
      console.log("eDoc download completed:", downloadInfo.filename);

      // Open the viewer in a new tab
      const viewerUrl =
        chrome.runtime.getURL("viewer.html") +
        `?action=open&downloadId=${downloadInfo.id}&suggestedFile=${encodeURIComponent(downloadInfo.filename)}`;

      chrome.tabs.create({ url: viewerUrl });
    }
  }
});

// Listen for file handler open action
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open-edoc" && message.fileData) {
    // Handle file opening
    console.log("File handler opening file:", message.filename);

    // Open viewer with the file data
    const viewerUrl =
      chrome.runtime.getURL("viewer.html") +
      `?action=open&suggestedFile=${encodeURIComponent(message.filename || "document.edoc")}`;

    chrome.tabs.create({ url: viewerUrl }, (tab) => {
      // Store file data in temporary storage for the new tab to access
      chrome.storage.local.set({
        tempFileData: {
          tabId: tab.id,
          fileData: message.fileData,
          filename: message.filename,
          timestamp: Date.now(),
        },
      });
    });

    sendResponse({ success: true });
    return true;
  }
});

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // First time installation - open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL("welcome.html"),
    });
  }
});

// Ensure the extension is registered as a file handler for .edoc and .asice files
console.log("eDoc Viewer background script loaded");
