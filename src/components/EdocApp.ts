import { VERSION } from "../config/version";
import { LitElement, html, css, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import { isRunningAsPWA } from "../webapp/fileHandling";

// Import Shoelace components
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

// Import custom components
import "./EdocFileDropzone";
import "./EdocSignatures";
import "./EdocDocuments";
import "./EdocMetadata";
import "./EdocLoading";
import "./EdocError";
import "./EdocLanguageSelector";
import "./EdocOfflineNotice";
import "./EdocInstallButton";
import "./EdocLegalModal";
import "./EdocFilePreview";

// Import parser
import {
  EdocContainer,
  SignatureValidationResult,
  parseEdocFile,
  verifyEdocSignatures,
} from "../core/parser";

/**
 * Main application component for eDoc Viewer
 */
@customElement("edoc-app")
export class EdocApp extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      font-family: var(--sl-font-sans);
      color: var(--sl-color-gray-900);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .app-header {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .app-logo {
      height: 3rem;
      width: 3rem;
    }

    .app-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--sl-color-primary-800);
    }

    .beta-tag {
      display: inline-block;
      background-color: var(--sl-color-primary-600);
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      margin-left: 0.5rem;
      vertical-align: middle;
      font-weight: 600;
    }

    .app-description-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.5rem 0 0 0;
      flex-wrap: wrap;
    }

    .app-description {
      font-size: 1rem;
      font-weight: normal;
      color: var(--sl-color-gray-600);
      margin: 0;
    }

    .learn-more-link {
      display: inline-flex;
      align-items: center;
      color: var(--sl-color-primary-600);
      text-decoration: none;
      margin-left: 0.75rem;
      font-size: 0.875rem;
      white-space: nowrap;
      transition: color 0.2s ease;
    }

    .learn-more-link:hover {
      color: var(--sl-color-primary-800);
      text-decoration: underline;
    }

    .learn-more-link sl-icon {
      margin-right: 0.25rem;
      font-size: 0.875rem;
    }

    /* Make it responsive for smaller screens */
    @media (max-width: 600px) {
      .app-description-wrapper {
        flex-direction: column;
        gap: 0.5rem;
      }

      .learn-more-link {
        margin-left: 0;
      }
    }

    .file-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      margin-bottom: 1rem;
    }

    .file-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--sl-color-gray-700);
      margin: 0;
      flex-grow: 1;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    main {
      margin-bottom: 2rem;
    }

    .edoc-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: var(--sl-shadow-medium);
    }

    footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--sl-color-gray-500);
    }

    footer a {
      color: var(--sl-color-gray-500);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    footer a:hover {
      color: var(--sl-color-primary-600);
    }

    .footer-links {
      margin-top: 0.25rem;
    }

    .version-info {
      font-size: 0.75rem;
      color: var(--sl-color-gray-400);
      margin-top: 0.25rem;
    }

    .hidden {
      display: none !important;
    }

    .header-language-selector {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `;

  @state() private view: "upload" | "result" = "upload";
  @state() private currentYear = new Date().getFullYear();
  @state() private container: EdocContainer | null = null;
  @state() private signatures: SignatureValidationResult[] = [];
  @state() private loading = false;
  @state() private error = "";
  @state() private processingCount = 0; // Track active file processing
  @state() private version = VERSION;
  @state() private currentFileName = ""; // Track current file name

  connectedCallback() {
    super.connectedCallback();

    // Signal that the component is connected and ready to render
    this.dispatchEvent(
      new CustomEvent("edoc-app-connected", {
        bubbles: true,
        composed: true,
      }),
    );

    // Add explicit listeners for file handling
    this.addEventListener("file-selected", (e: Event) => {
      this.onFileSelected(e as CustomEvent);
    });

    // Global event for fallback
    window.addEventListener("fileHandlingFiles", (e: Event) => {
      const customEvent = e as CustomEvent;
      const files = customEvent.detail?.files;

      if (files && files.length > 0) {
        const file = files[0]; // Process the first file
        this.onFileSelected(
          new CustomEvent("file-selected", {
            detail: { file },
          }),
        );
      }
    });

    // Notify when the component has been rendered
    window.requestAnimationFrame(() => {
      this.dispatchEvent(
        new CustomEvent("edoc-app-rendered", {
          bubbles: true,
          composed: true,
        }),
      );

      // Also signal the initialization system
      if (document.documentElement.classList.contains("js-loaded") === false) {
        document.documentElement.classList.add("js-loaded");
      }
    });
    this.handleUrlHash();
    // Also listen for hash changes
    window.addEventListener("hashchange", () => this.handleUrlHash());

    // Listen for the modal closing to ensure URL is clean
    this.addEventListener("edoc-legal-modal-closed", () => {
      // Clear URL hash
      if (window.location.hash) {
        history.replaceState(
          "",
          document.title,
          window.location.pathname + window.location.search,
        );
      }
    });
  }

  private handleUrlHash() {
    const hash = window.location.hash.slice(1); // Remove the # character

    // Don't process empty hashes
    if (!hash) return;

    // Check if the hash matches any of our legal sections
    if (["about", "terms", "privacy", "disclaimer"].includes(hash)) {
      // Wait for components to be ready
      setTimeout(() => {
        const legalModal = this.shadowRoot?.querySelector(
          "edoc-legal-modal",
        ) as any;
        if (legalModal) {
          // Set the active tab
          legalModal.activeTab = hash;
          console.log("EdocApp, set legalModal.activeTab to: ", hash);
          // Open the modal
          legalModal.open();
        }
      }, 100);
      return; // Return to prevent further processing
    }

    // Handle specific section anchors
    // Format: #section-anchor (e.g., #privacy-data)
    const sectionMatch = hash.match(/^(about|terms|privacy|disclaimer)-(.+)$/);
    if (sectionMatch) {
      const section = sectionMatch[1];
      const anchor = sectionMatch[2];

      setTimeout(() => {
        const legalModal = this.shadowRoot?.querySelector(
          "edoc-legal-modal",
        ) as any;
        if (legalModal) {
          // Set the active tab and anchor before opening to ensure proper rendering
          legalModal.activeTab = section;
          legalModal.anchor = `${section}-${anchor}`;
          // Open the modal with a small delay to ensure properties are set
          setTimeout(() => {
            legalModal.open();
          }, 50);
        }
      }, 100);
    }
  }

  /**
   * Helper function to open the legal modal with a specific section and anchor
   * This can be called from external components or internally
   * @param section The tab section to open
   * @param anchor Optional anchor within the section
   * @param needsPrefix Whether to prefix the anchor with the section name
   */
  public openLegalModalWithSection(
    section: "about" | "terms" | "privacy" | "disclaimer" = "about",
    anchor?: string,
    needsPrefix: boolean = true,
  ) {
    const legalModal = this.shadowRoot?.querySelector(
      "edoc-legal-modal",
    ) as any;

    if (legalModal) {
      // Set active tab
      legalModal.activeTab = section;

      // Set anchor if provided
      if (anchor) {
        // Add section prefix if needed (for direct links to anchor IDs)
        legalModal.anchor = needsPrefix ? `${section}-${anchor}` : anchor;
      } else {
        legalModal.anchor = undefined;
      }

      // Open the modal after a small delay to ensure properties are properly set
      setTimeout(() => {
        legalModal.open();
      }, 50);
    }
  }

  /**
   * Event handler for opening the legal modal from UI elements
   * @param e The click event
   * @param section The tab section to open
   * @param anchor Optional anchor within the section
   */
  private openLegalModal(
    e: Event,
    section?: "about" | "terms" | "privacy" | "disclaimer",
    anchor?: string,
  ) {
    e.preventDefault();
    // Call the shared implementation but don't prefix the anchor
    // since it's already prefixed in the UI
    this.openLegalModalWithSection(section, anchor, false);
  }

  render() {
    const isStandalone = isRunningAsPWA();

    return html`
      <div class="container">
        <div class="header-language-selector">
          ${isStandalone
            ? html`
                <sl-button
                  size="small"
                  @click=${() => this.openLegalModalWithSection("about")}
                >
                  <sl-icon
                    slot="prefix"
                    name="question-square-fill"
                    style="font-size: 16px;"
                  ></sl-icon>
                  ${msg("About", { id: "legal.about_tab" })}
                </sl-button>
              `
            : html`<edoc-install-button></edoc-install-button>`}
          <edoc-language-selector
            locale="${this.currentLocale}"
          ></edoc-language-selector>
        </div>

        <header>
          <div class="app-header">
            <img
              src="/icons/edoc-icon.svg"
              alt="eDoc Viewer Logo"
              class="app-logo"
            />
            <h1 class="app-title">
              ${msg("eDoc Viewer", { id: "app.title" })}
              <span class="beta-tag">BETA</span>
            </h1>
          </div>

          ${!isStandalone
            ? html`
                <div class="app-description-wrapper">
                  <h2 class="app-description">
                    ${msg(
                      "View and verify EU standard ASiC-E and Latvian eDoc XAdES electronic signature files (.asice, .sce, .edoc)",
                      {
                        id: "app.description",
                      },
                    )}
                  </h2>

                  <a
                    href="#about"
                    class="learn-more-link"
                    @click=${(e: Event) => this.openLegalModal(e, "about")}
                  >
                    <sl-icon name="question-square-fill"></sl-icon>
                    ${msg("Learn more", { id: "app.learn_more" })}
                  </a>
                </div>
              `
            : nothing}
        </header>

        <main>
          <!-- Upload Section - Only shown in upload view -->
          <div
            class="edoc-container ${this.view === "upload" ? "" : "hidden"}"
            id="upload-section"
          >
            <edoc-file-dropzone
              @file-selected=${this.onFileSelected}
            ></edoc-file-dropzone>
          </div>

          <!-- Result Section - Only shown in result view -->
          <div
            class="edoc-container ${this.view === "result" ? "" : "hidden"}"
            id="result-section"
          >
            <!-- File navigation bar with back button, title, and language selector -->
            <div class="file-nav-bar">
              <sl-button @click=${this.goBack} size="small">
                <sl-icon
                  slot="prefix"
                  name="arrow-left"
                  style="font-size: 16px;"
                ></sl-icon>
                ${msg("Back", { id: "app.backButtonLabel" })}
              </sl-button>

              <h2 class="file-title" title="${this.currentFileName}">
                ${this.currentFileName}
              </h2>
            </div>

            <!-- Loading indicator -->
            <edoc-loading ?visible=${this.loading}></edoc-loading>

            <!-- Error message -->
            <edoc-error
              ?visible=${!!this.error}
              .message=${this.error}
            ></edoc-error>

            <!-- Only show content when not loading and we have data -->
            ${!this.loading
              ? html`
                  <!-- Only show signatures if we have them -->
                  ${this.signatures.length > 0
                    ? html`
                        <edoc-signatures
                          .signatures=${this.signatures}
                        ></edoc-signatures>
                      `
                    : ""}

                  <!-- Only show documents if we have a container -->
                  ${this.container
                    ? html`
                        <edoc-documents
                          .files=${this.container.documentFileList || []}
                          @file-download=${this.handleFileDownload}
                          @file-view=${this.handleFileView}
                          @files-download-all=${this.handleFilesDownloadAll}
                        ></edoc-documents>
                        <edoc-metadata
                          .files=${this.container.metadataFileList || []}
                          @file-download=${this.handleFileDownload}
                        ></edoc-metadata>
                      `
                    : ""}
                `
              : ""}
          </div>
        </main>

        <footer>
          <p>
            &copy; ${this.currentYear}
            <a target="_blank" href="https://edgarsjekabsons.lv"
              >Edgars Jēkabsons</a
            >,
            <a target="_blank" href="https://zenomy.tech">ZenomyTech SIA</a>
            &nbsp;|&nbsp;
            <span class="version-info">
              ${msg("Version", { id: "app.version" })}: ${this.version.number}
              <span title="${this.version.commit}"
                >(${this.version.commit.substring(0, 7)})</span
              >
            </span>
          </p>
          <p class="footer-links">
            <a target="_blank" href="https://github.com/edgarsj/edocviewer">
              <sl-icon
                name="github"
                style="vertical-align: -0.125em; margin-right: 4px;"
              ></sl-icon>
              ${msg("Open Source", { id: "app.open_source" })}
            </a>
            &nbsp;|&nbsp;
            <a
              href="#about"
              @click=${(e: Event) => this.openLegalModal(e, "about")}
            >
              <sl-icon
                name="question-square-fill"
                style="vertical-align: -0.125em; margin-right: 4px;"
              ></sl-icon>
              ${msg("About", { id: "legal.about_tab" })}
            </a>
            &nbsp;|&nbsp;
            <a
              href="#terms"
              @click=${(e: Event) => this.openLegalModal(e, "terms")}
            >
              ${msg("Terms", { id: "legal.terms_tab" })}
            </a>
            &nbsp;|&nbsp;
            <a
              href="#privacy"
              @click=${(e: Event) => this.openLegalModal(e, "privacy")}
            >
              ${msg("Privacy", { id: "legal.privacy_tab" })}
            </a>
            &nbsp;|&nbsp;
            <a
              href="#disclaimer"
              @click=${(e: Event) => this.openLegalModal(e, "disclaimer")}
            >
              ${msg("Disclaimers", { id: "legal.disclaimer_tab" })}
            </a>
            &nbsp;|&nbsp;
            ${msg("Questions, suggestions, or bug reports", {
              id: "app.questions_support",
            })}:
            <a href="mailto:edocviewer@zenomy.tech"> edocviewer@zenomy.tech </a>
          </p>
        </footer>

        <edoc-offline-notice></edoc-offline-notice>
        <edoc-legal-modal></edoc-legal-modal>
      </div>
    `;
  }

  private async onFileSelected(e: CustomEvent) {
    try {
      const { file } = e.detail;

      if (!file) {
        console.error("No file in event detail");
        return;
      }

      // Avoid processing the same file multiple times
      this.processingCount++;
      const currentProcessingId = this.processingCount;

      // Store the file name
      this.currentFileName = file.name;

      // Show loading state and result view
      this.loading = true;
      this.view = "result";
      this.error = "";
      this.container = null;
      this.signatures = [];

      // Request a re-render to show loading state immediately
      await this.updateComplete;

      // Check if this processing was superseded
      if (currentProcessingId !== this.processingCount) {
        return;
      }

      // Read the file as an ArrayBuffer
      const fileBuffer = await this.readFileAsArrayBuffer(file);

      // Check if this processing was superseded
      if (currentProcessingId !== this.processingCount) {
        return;
      }

      // Parse the eDoc container
      this.container = await parseEdocFile(new Uint8Array(fileBuffer));

      // Check if this processing was superseded
      if (currentProcessingId !== this.processingCount) {
        return;
      }

      // Process signatures
      this.signatures = await verifyEdocSignatures(this.container);
    } catch (error) {
      console.error("File processing error:", error);
      this.error = `Error processing file: ${(error as Error).message}`;
    } finally {
      this.loading = false;

      // Wait for rendering to complete
      await this.updateComplete;
    }
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };

      reader.onerror = () => {
        reject(reader.error || new Error("Unknown error reading file"));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  private handleFileDownload(e: CustomEvent) {
    const { filename } = e.detail;

    if (!this.container || !filename) {
      console.error("Missing container or filename");
      return;
    }

    const fileData = this.container.files.get(filename);
    if (!fileData) {
      console.error(`File not found: ${filename}`);
      return;
    }

    // Create a download link for a single file
    const blob = new Blob([fileData]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.getFileNameFromPath(filename);

    // Add to DOM, click, and remove
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  private isMobileDevice(): boolean {
    // Simple mobile device detection
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  private handleFileView(e: CustomEvent) {
    const { filename } = e.detail;
    if (!this.container || !filename) return;

    const fileData = this.container.files.get(filename);
    if (!fileData) {
      console.error(`File not found: ${filename}`);
      return;
    }

    // Check if this is a PDF file for mobile workaround
    const extension = this.getFileExtension(filename).toLowerCase();
    const isPDF = extension === "pdf";

    // If it's a PDF and we're on mobile, open in a new tab directly
    if (isPDF && this.isMobileDevice()) {
      // Create blob and object URL
      const blob = new Blob([fileData], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, "_blank");

      // Clean up the object URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      return;
    }

    // Find the preview component or create it if it doesn't exist
    let previewComponent = this.shadowRoot?.querySelector("edoc-file-preview");
    if (!previewComponent) {
      previewComponent = document.createElement("edoc-file-preview");
      this.shadowRoot?.appendChild(previewComponent);
    }

    // Set properties and show the preview
    const preview = previewComponent as any;
    preview.fileName = this.getFileNameFromPath(filename);
    preview.fileData = fileData;
    preview.mimeType = this.getContentType(filename);
    preview.show();
  }

  private handleFilesDownloadAll(e: CustomEvent) {
    const { files } = e.detail;
    if (!this.container || !files || !files.length) return;

    // Download files one by one with a slight delay
    files.forEach((filename: string, index: number) => {
      setTimeout(() => {
        const fileData = this.container?.files.get(filename);
        if (!fileData) {
          console.error(`File not found: ${filename}`);
          return;
        }

        // Create download link
        const blob = new Blob([fileData]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.getFileNameFromPath(filename);
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }, index * 500); // 500ms delay between downloads to prevent browser issues
    });
  }

  private getContentType(filename: string): string {
    const extension = this.getFileExtension(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc: "application/msword",
      xml: "application/xml",
      txt: "text/plain",
      csv: "text/csv",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };

    return contentTypes[extension] || "application/octet-stream";
  }

  private getFileExtension(filename: string): string {
    return filename.split(".").pop() || "";
  }

  private getFileNameFromPath(path: string): string {
    return path.split("/").pop() || path;
  }

  private goBack() {
    // Reset state and go back to upload view
    this.view = "upload";
    this.container = null;
    this.signatures = [];
    this.error = "";
  }
}
