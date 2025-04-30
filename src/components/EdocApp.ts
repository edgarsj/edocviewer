import { VERSION } from "../config/version";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";

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

    .app-description {
      color: var(--sl-color-gray-600);
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
  `;

  @state() private view: "upload" | "result" = "upload";
  @state() private currentYear = new Date().getFullYear();
  @state() private container: EdocContainer | null = null;
  @state() private signatures: SignatureValidationResult[] = [];
  @state() private loading = false;
  @state() private error = "";
  @state() private processingCount = 0; // Track active file processing
  @state() private version = VERSION;

  connectedCallback() {
    super.connectedCallback();

    // Signal that the component is connected and ready to render
    console.log("EdocApp: Component connected");
    this.dispatchEvent(
      new CustomEvent("edoc-app-connected", {
        bubbles: true,
        composed: true,
      }),
    );

    // Add explicit listeners for file handling
    console.log("EdocApp: Adding event listeners for file handling");

    // Direct file-selected event handler
    this.addEventListener("file-selected", (e: Event) => {
      console.log(
        "EdocApp: Received file-selected event directly on component",
      );
      this.onFileSelected(e as CustomEvent);
    });

    // Global event for fallback
    window.addEventListener("fileHandlingFiles", (e: Event) => {
      console.log("EdocApp: Received fileHandlingFiles event from window");
      const customEvent = e as CustomEvent;
      const files = customEvent.detail?.files;

      if (files && files.length > 0) {
        const file = files[0]; // Process the first file
        console.log(
          `EdocApp: Processing file "${file.name}" from global event`,
        );
        this.onFileSelected(
          new CustomEvent("file-selected", {
            detail: { file },
          }),
        );
      }
    });

    // Notify when the component has been rendered
    // This is a good signal to hide the static content
    window.requestAnimationFrame(() => {
      console.log("EdocApp: Component rendered");
      this.dispatchEvent(
        new CustomEvent("edoc-app-rendered", {
          bubbles: true,
          composed: true,
        }),
      );

      // Also signal the initialization system
      if (document.documentElement.classList.contains("js-loaded") === false) {
        console.log("EdocApp: Manually adding js-loaded class");
        document.documentElement.classList.add("js-loaded");
      }
    });
  }

  render() {
    return html`
      <div class="container">
        <header>
          <div class="app-header">
            <img
              src="/icons/edoc-icon.svg"
              alt="eDoc Viewer Logo"
              class="app-logo"
            />
            <h1 class="app-title">
              ${msg("eDoc Viewer")}
              <span class="beta-tag">BETA</span>
            </h1>
          </div>

          <p class="app-description">
            ${msg("View and verify EU standard ASiC-E and Latvian eDoc files")}
          </p>

          <div>
            <edoc-language-selector></edoc-language-selector>
          </div>
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
            <!-- Back button -->
            <div>
              <sl-button @click=${this.goBack}>
                <!-- Using sl-icon with custom size to match the original SVG dimensions -->
                <sl-icon
                  slot="prefix"
                  name="arrow-left"
                  style="font-size: 16px;"
                ></sl-icon>
                ${msg("Back")}
              </sl-button>
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
            <a href="https://edgarsjekabsons.lv">Edgars Jēkabsons</a> /
            <a href="https://zenomy.tech">ZenomyTech SIA</a> &nbsp;|&nbsp;
            <span class="version-info">
              ${msg("Version")}: ${this.version.number}
              <span title="${this.version.commit}"
                >(${this.version.commit.substring(0, 7)})</span
              >
            </span>
          </p>
          <p class="footer-links">
            <a href="https://github.com/edgarsj/edocviewer">
              <sl-icon
                name="github"
                style="vertical-align: -0.125em; margin-right: 4px;"
              ></sl-icon>
              ${msg("Open Source")}
            </a>
            &nbsp;|&nbsp; ${msg("Questions, suggestions, or bug reports")}:
            <a href="mailto:edocviewer@zenomy.tech"> edocviewer@zenomy.tech </a>
          </p>
        </footer>

        <edoc-offline-notice></edoc-offline-notice>
      </div>
    `;
  }

  private async onFileSelected(e: CustomEvent) {
    try {
      const { file } = e.detail;

      if (!file) {
        console.error("EdocApp: No file in event detail");
        return;
      }

      // Avoid processing the same file multiple times
      this.processingCount++;
      const currentProcessingId = this.processingCount;

      console.log(
        `EdocApp: File selected (processing ID ${currentProcessingId}):`,
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type,
      );

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
        console.log(
          `EdocApp: Processing ${currentProcessingId} was superseded, aborting`,
        );
        return;
      }

      // Read the file as an ArrayBuffer
      console.log(
        `EdocApp: Reading file as ArrayBuffer (${currentProcessingId})`,
      );
      const fileBuffer = await this.readFileAsArrayBuffer(file);
      console.log(
        `EdocApp: File read successful, buffer size: ${fileBuffer.byteLength} (${currentProcessingId})`,
      );

      // Check if this processing was superseded
      if (currentProcessingId !== this.processingCount) {
        console.log(
          `EdocApp: Processing ${currentProcessingId} was superseded, aborting`,
        );
        return;
      }

      // Parse the eDoc container
      console.log(`EdocApp: Parsing eDoc file (${currentProcessingId})`);
      this.container = await parseEdocFile(new Uint8Array(fileBuffer));
      console.log(
        `EdocApp: Container parsed successfully (${currentProcessingId})`,
        this.container
          ? {
              documentFiles: this.container.documentFileList?.length || 0,
              metadataFiles: this.container.metadataFileList?.length || 0,
              totalFiles: this.container.files?.size || 0,
            }
          : "No container",
      );

      // Check if this processing was superseded
      if (currentProcessingId !== this.processingCount) {
        console.log(
          `EdocApp: Processing ${currentProcessingId} was superseded, aborting`,
        );
        return;
      }

      // Process signatures
      console.log(`EdocApp: Verifying signatures (${currentProcessingId})`);
      this.signatures = await verifyEdocSignatures(this.container);
      console.log(
        `EdocApp: Signature verification complete (${currentProcessingId})`,
        { signatureCount: this.signatures.length },
      );
    } catch (error) {
      console.error("EdocApp: File processing error:", error);
      this.error = `Error processing file: ${(error as Error).message}`;
    } finally {
      this.loading = false;
      console.log("EdocApp: File processing complete");

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
    console.log(`EdocApp: Handling file download for ${filename}`);

    if (!this.container || !filename) {
      console.error("Missing container or filename");
      return;
    }

    const fileData = this.container.files.get(filename);
    if (!fileData) {
      console.error(`File not found: ${filename}`);
      return;
    }

    console.log(
      `Creating download for ${filename}, size: ${fileData.length} bytes`,
    );

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
      console.log(`Download initiated for ${filename}`);
    }, 100);
  }

  private handleFileView(e: CustomEvent) {
    const { filename } = e.detail;
    if (!this.container || !filename) return;

    const fileData = this.container.files.get(filename);
    if (!fileData) {
      console.error(`File not found: ${filename}`);
      return;
    }

    // Create a blob URL and open in new tab
    const blob = new Blob([fileData], { type: this.getContentType(filename) });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    // Clean up URL after some time
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  private handleFilesDownloadAll(e: CustomEvent) {
    const { files } = e.detail;
    if (!this.container || !files || !files.length) return;

    // Create a zip file using JSZip (would need to be added as a dependency)
    // For now, let's use a simpler approach - download files one by one with a slight delay
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
