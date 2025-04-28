import "../webapp/main.css";
import { FileDropzone } from "../components/FileDropzone";
import {
  parseEdocFile,
  verifyEdocSignatures,
  EdocContainer,
  SignatureValidationResult,
} from "../core/parser";
import { downloadFile, deriveFilename } from "../utils/download";
import i18n, { SupportedLanguage } from "../utils/i18n";

class EdocViewer {
  private container: EdocContainer | null = null;
  private fileData: Uint8Array | null = null;
  private originalUrl: string | null = null;
  private suggestedFile: string | null = null;
  private dropzone: FileDropzone | null = null;

  constructor() {
    this.initializeApp();
  }

  /**
   * Initialize the application
   */
  private initializeApp(): void {
    // Set current year in footer
    document.getElementById("current-year")!.textContent = new Date()
      .getFullYear()
      .toString();

    // Initialize internationalization
    i18n.loadSavedLanguage();
    this.setupLanguageSelector();

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    this.originalUrl = urlParams.get("file");
    const action = urlParams.get("action");
    this.suggestedFile = urlParams.get("suggestedFile");

    // Initialize the UI based on parameters
    if (action === "upload") {
      this.setupUploadInterface();
    } else if (this.originalUrl) {
      this.loadFromUrl(this.originalUrl);
    } else {
      this.setupUploadInterface();
    }

    // Setup back button
    document.getElementById("back-btn")?.addEventListener("click", () => {
      this.showUploadView();
    });

    // Setup download original button
    document
      .getElementById("download-original-btn")
      ?.addEventListener("click", () => {
        this.downloadOriginalFile();
      });

    // Apply initial translations
    i18n.applyTranslations();
    this.updateDynamicTranslations();
  }

  /**
   * Setup language selector
   */
  private setupLanguageSelector(): void {
    const languageSelector = document.getElementById(
      "language-selector",
    ) as HTMLSelectElement;
    if (!languageSelector) return;

    // Set initial value based on current language
    languageSelector.value = i18n.getLanguage();

    // Handle language change
    languageSelector.addEventListener("change", () => {
      const selectedLang = languageSelector.value as SupportedLanguage;
      i18n.setLanguage(selectedLang);
    });

    // Subscribe to language changes
    i18n.subscribe(() => {
      this.updateDynamicTranslations();
      i18n.applyTranslations();
    });
  }

  /**
   * Update dynamic translations that aren't covered by data-i18n attributes
   */
  private updateDynamicTranslations(): void {
    // Update app description
    const appDescription = document.getElementById("app-description");
    if (appDescription) {
      appDescription.textContent = i18n.translate("appDescription");
    }

    // Update language selector label
    const langLabel = document.getElementById("lang-label");
    if (langLabel) {
      langLabel.textContent = i18n.translate("language.label");
    }

    // Update button texts
    const backBtn = document.getElementById("back-btn-text");
    if (backBtn) {
      backBtn.textContent = i18n.translate("buttons.back");
    }

    const downloadOriginalBtn = document.getElementById(
      "download-original-btn-text",
    );
    if (downloadOriginalBtn) {
      downloadOriginalBtn.textContent = i18n.translate(
        "buttons.downloadOriginal",
      );
    }

    const loadingText = document.getElementById("loading-text");
    if (loadingText) {
      loadingText.textContent = i18n.translate("loading");
    }

    const errorTitle = document.getElementById("error-title");
    if (errorTitle) {
      errorTitle.textContent = i18n.translate("error.title");
    }
  }

  /**
   * Setup the file upload interface
   */
  private setupUploadInterface(): void {
    this.showUploadView();

    // Initialize dropzone
    this.dropzone = new FileDropzone({
      dropzoneId: "dropzone",
      fileInputId: "file-input",
      selectButtonId: "select-file-btn",
      suggestedFileName: this.suggestedFile || undefined,
      suggestedFileContainerId: "suggested-file-container",
      suggestedFileNameId: "suggested-file-name",
      onFileSelected: (file) => {
        this.handleFileSelection(file);
      },
    });
  }

  /**
   * Show the upload view and hide the result view
   */
  private showUploadView(): void {
    document.getElementById("upload-section")!.classList.remove("hidden");
    document.getElementById("result-section")!.classList.add("hidden");
  }

  /**
   * Show the result view and hide the upload view
   */
  private showResultView(): void {
    document.getElementById("upload-section")!.classList.add("hidden");
    document.getElementById("result-section")!.classList.remove("hidden");
  }

  /**
   * Handle file selection from the dropzone
   */
  private handleFileSelection(file: File): void {
    this.showResultView();
    this.showLoading();

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.fileData = new Uint8Array(e.target!.result as ArrayBuffer);
        this.processEdocFile(this.fileData);
      } catch (error) {
        this.showError(
          `${i18n.translate("error.processingError")}: ${(error as Error).message}`,
        );
      }
    };

    reader.onerror = () => {
      this.showError(i18n.translate("error.fileNotFound"));
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Load edoc file from URL
   */
  private async loadFromUrl(url: string): Promise<void> {
    this.showResultView();
    this.showLoading();

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(i18n.translate("error.fileNotFound"));
      }

      const arrayBuffer = await response.arrayBuffer();
      this.fileData = new Uint8Array(arrayBuffer);
      this.processEdocFile(this.fileData);
    } catch (error) {
      this.showError(
        `${i18n.translate("error.processingError")}: ${(error as Error).message}`,
      );
      this.setupUploadInterface(); // Show upload interface as fallback
    }
  }

  /**
   * Process the edoc file data
   */
  private async processEdocFile(fileData: Uint8Array): Promise<void> {
    try {
      // Parse the container
      this.container = parseEdocFile(fileData);

      // Verify signatures
      const signatureResults = await verifyEdocSignatures(this.container);

      // Display the results
      this.displayEdocContent(this.container, signatureResults);
    } catch (error) {
      this.showError(
        `${i18n.translate("error.processingError")}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Display the edoc content
   */
  private displayEdocContent(
    container: EdocContainer,
    signatures: SignatureValidationResult[],
  ): void {
    // Clear loading indicator
    this.hideLoading();
    this.hideError();

    // Get container elements
    const signaturesContainer = document.getElementById(
      "signatures-container",
    )!;
    const documentsContainer = document.getElementById("documents-container")!;
    const metadataContainer = document.getElementById("metadata-container")!;

    // Clear previous content
    signaturesContainer.innerHTML = "";
    documentsContainer.innerHTML = "";
    metadataContainer.innerHTML = "";

    // Show containers
    signaturesContainer.classList.remove("hidden");
    documentsContainer.classList.remove("hidden");

    // Display signatures
    if (signatures && signatures.length > 0) {
      const signatureTemplate = document.getElementById(
        "signature-template",
      ) as HTMLTemplateElement;
      const signatureItemTemplate = document.getElementById(
        "signature-item-template",
      ) as HTMLTemplateElement;

      const signatureSection = signatureTemplate.content.cloneNode(
        true,
      ) as DocumentFragment;
      const signatureItems =
        signatureSection.querySelector(".signature-items")!;

      // Add each signature
      signatures.forEach((signature) => {
        const signatureItem = signatureItemTemplate.content.cloneNode(
          true,
        ) as DocumentFragment;
        const signerInfo = signatureItem.querySelector(".signer-info")!;
        const signatureStatus =
          signatureItem.querySelector(".signature-status")!;
        const fileCoverageDetails = signatureItem.querySelector(
          ".file-coverage-details",
        )!;

        // Display signer info
        if (
          signature.signerInfo.signerName ||
          signature.signerInfo.personalId
        ) {
          signerInfo.innerHTML = `
            <strong>${i18n.translate("signatures.signedBy")}</strong> ${signature.signerInfo.signerName}${
              signature.signerInfo.personalId
                ? `, ID: ${signature.signerInfo.personalId}`
                : ""
            }
          `;
        }

        // Display validation status
        signatureStatus.innerHTML = `
          <strong>${i18n.translate("signatures.signatureStatus")}</strong>
          <span class="${signature.valid ? "valid" : "invalid"}">
            ${signature.valid ? i18n.translate("signatures.valid") : i18n.translate("signatures.invalid")}
          </span>
          ${signature.error ? `<div class="error-message">${signature.error}</div>` : ""}
        `;

        // If not all documents are signed but the signature itself is valid, show details
        if (
          !signature.allDocumentsSigned &&
          signature.originalVerificationValid
        ) {
          fileCoverageDetails.classList.remove("hidden");
          let fileDetailsHtml = "";

          if (signature.signedFiles.length > 0) {
            fileDetailsHtml += `<div class="signed-files mb-3">
              <strong>${i18n.translate("signatures.referencedFiles")} (${signature.signedFiles.length}):</strong>
              <ul class="mt-2 max-h-32 overflow-y-auto bg-white p-2 border border-edoc-200 rounded">
                ${signature.signedFiles.map((file) => `<li>${file}</li>`).join("")}
              </ul>
            </div>`;
          }

          if (signature.unsignedFiles.length > 0) {
            fileDetailsHtml += `<div class="unsigned-files text-red-600">
              <strong>${i18n.translate("signatures.unsignedFiles")} (${signature.unsignedFiles.length}):</strong>
              <ul class="mt-2 max-h-32 overflow-y-auto bg-white p-2 border border-red-200 rounded">
                ${signature.unsignedFiles.map((file) => `<li>${file}</li>`).join("")}
              </ul>
            </div>`;
          }

          fileCoverageDetails.innerHTML = fileDetailsHtml;
        }

        signatureItems.appendChild(signatureItem);
      });

      signaturesContainer.appendChild(signatureSection);
    } else {
      signaturesContainer.innerHTML = `
        <div class="signature-section">
          <h3 class="section-title">${i18n.translate("signatures.title")}</h3>
          <p class="text-gray-600">${i18n.translate("signatures.noSignatures")}</p>
        </div>
      `;
    }

    // Display document files
    if (container.documentFileList && container.documentFileList.length > 0) {
      const documentsTemplate = document.getElementById(
        "documents-template",
      ) as HTMLTemplateElement;
      const fileItemTemplate = document.getElementById(
        "file-item-template",
      ) as HTMLTemplateElement;

      const documentsSection = documentsTemplate.content.cloneNode(
        true,
      ) as DocumentFragment;
      const filesContainer = documentsSection.querySelector(".files")!;

      container.documentFileList.forEach((filename) => {
        const fileContent = container.files.get(filename);
        if (fileContent) {
          const fileItem = fileItemTemplate.content.cloneNode(
            true,
          ) as DocumentFragment;
          const nameElement = fileItem.querySelector(".file-name")!;
          const downloadButton = fileItem.querySelector(".download-btn")!;
          const viewButton = fileItem.querySelector(
            ".view-btn",
          ) as HTMLButtonElement;

          // Set filename
          nameElement.textContent = filename;

          // Setup download button
          const actualFilename = filename.split("/").pop() || filename;
          downloadButton.addEventListener("click", () => {
            this.downloadContainerFile(actualFilename, fileContent);
          });

          // Setup view button for supported types
          const fileExtension = actualFilename.split(".").pop()?.toLowerCase();
          if (fileExtension === "pdf") {
            viewButton.classList.remove("hidden");
            viewButton.addEventListener("click", () => {
              this.viewFile(actualFilename, fileContent);
            });
          }

          filesContainer.appendChild(fileItem);
        }
      });

      documentsContainer.appendChild(documentsSection);
    } else {
      documentsContainer.innerHTML = `
        <div class="document-section">
          <h3 class="section-title">${i18n.translate("documents.title")}</h3>
          <p class="text-gray-600">${i18n.translate("documents.noDocuments")}</p>
        </div>
      `;
    }

    // Display metadata files (if any)
    if (container.metadataFileList && container.metadataFileList.length > 0) {
      metadataContainer.classList.remove("hidden");

      const metadataTemplate = document.getElementById(
        "metadata-template",
      ) as HTMLTemplateElement;
      const fileItemTemplate = document.getElementById(
        "file-item-template",
      ) as HTMLTemplateElement;

      const metadataSection = metadataTemplate.content.cloneNode(
        true,
      ) as DocumentFragment;
      const filesContainer = metadataSection.querySelector(".files")!;
      const metadataHeader = metadataSection.querySelector(".metadata-header")!;
      const metadataContent =
        metadataSection.querySelector(".metadata-content")!;

      // Setup toggle functionality
      metadataHeader.addEventListener("click", () => {
        const expandIcon = metadataHeader.querySelector(
          ".expand-icon",
        ) as SVGElement;
        if (metadataContent.classList.contains("hidden")) {
          metadataContent.classList.remove("hidden");
          expandIcon.innerHTML = `
            <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
          `;
        } else {
          metadataContent.classList.add("hidden");
          expandIcon.innerHTML = `
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          `;
        }
      });

      container.metadataFileList.forEach((filename) => {
        const fileContent = container.files.get(filename);
        if (fileContent) {
          const fileItem = fileItemTemplate.content.cloneNode(
            true,
          ) as DocumentFragment;
          const nameElement = fileItem.querySelector(".file-name")!;
          const downloadButton = fileItem.querySelector(".download-btn")!;

          // Set filename
          nameElement.textContent = filename;

          // Setup download button
          const actualFilename = filename.split("/").pop() || filename;
          downloadButton.addEventListener("click", () => {
            this.downloadContainerFile(actualFilename, fileContent);
          });

          filesContainer.appendChild(fileItem);
        }
      });

      metadataContainer.appendChild(metadataSection);
    }
  }

  /**
   * Download a file from the container
   */
  private downloadContainerFile(filename: string, content: Uint8Array): void {
    try {
      const mimeType = this.getMimeTypeFromFilename(filename);
      downloadFile(filename, content, { mimeType });
    } catch (error) {
      this.showError(
        `${i18n.translate("error.downloadError")}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * View a file (currently only supports PDF)
   */
  private viewFile(filename: string, content: Uint8Array): void {
    try {
      const mimeType = this.getMimeTypeFromFilename(filename);
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      // Open in new window or tab
      window.open(url, "_blank");

      // Clean up the URL object after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 30000);
    } catch (error) {
      this.showError(`Error viewing file: ${(error as Error).message}`);
    }
  }

  /**
   * Download the original edoc file
   */
  private downloadOriginalFile(): void {
    if (!this.fileData) {
      this.showError(i18n.translate("error.fileNotFound"));
      return;
    }

    const filename = deriveFilename(
      this.originalUrl || undefined,
      this.suggestedFile || undefined,
    );

    try {
      downloadFile(filename, this.fileData, {
        mimeType: "application/octet-stream",
      });
    } catch (error) {
      this.showError(
        `${i18n.translate("error.downloadError")}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Show loading indicator
   */
  private showLoading(): void {
    document.getElementById("loading")!.classList.remove("hidden");
  }

  /**
   * Hide loading indicator
   */
  private hideLoading(): void {
    document.getElementById("loading")!.classList.add("hidden");
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    const errorContainer = document.getElementById("error-container")!;
    const errorMessage = document.getElementById("error-message")!;

    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
  }

  /**
   * Hide error message
   */
  private hideError(): void {
    document.getElementById("error-container")!.classList.add("hidden");
  }

  /**
   * Get MIME type from filename
   */
  private getMimeTypeFromFilename(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "txt":
        return "text/plain";
      case "html":
        return "text/html";
      case "xml":
        return "application/xml";
      case "json":
        return "application/json";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      default:
        return "application/octet-stream";
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EdocViewer();
});
