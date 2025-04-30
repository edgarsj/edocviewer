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

  connectedCallback() {
    super.connectedCallback();

    // Signal that the component is connected and ready to render
    // This helps with the static/dynamic content transition
    this.dispatchEvent(
      new CustomEvent("edoc-app-connected", {
        bubbles: true,
        composed: true,
      }),
    );

    // Notify when the component has been rendered
    // This is a good signal to hide the static content
    window.requestAnimationFrame(() => {
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
                <!-- Inline SVG instead of sl-icon -->
                <svg
                  slot="prefix"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                  />
                </svg>
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
            <a href="https://zenomy.tech">ZenomyTech SIA</a>
          </p>
          <p class="footer-links">
            <a href="https://github.com/edgarsj/edocviewer" title="Open Source">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                style="vertical-align: text-bottom; margin-right: 4px;"
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
              GitHub
            </a>
            &nbsp;|&nbsp; Questions, suggestions, or bug reports:
            <a href="mailto:edocviewer@zenomy.tech"> edocviewer@zenomy.tech </a>
          </p>
        </footer>

        <edoc-offline-notice></edoc-offline-notice>
      </div>
    `;
  }

  private async onFileSelected(e: CustomEvent) {
    const { file } = e.detail;
    console.log("File selected:", file.name);

    // Show loading state and result view
    this.loading = true;
    this.view = "result";
    this.error = "";
    this.container = null;
    this.signatures = [];

    try {
      // Read the file as an ArrayBuffer
      const fileBuffer = await this.readFileAsArrayBuffer(file);

      // Parse the eDoc container
      this.container = await parseEdocFile(new Uint8Array(fileBuffer));

      // Process signatures
      this.signatures = await verifyEdocSignatures(this.container);
    } catch (error) {
      this.error = `Error processing file: ${(error as Error).message}`;
      console.error("File processing error:", error);
    } finally {
      this.loading = false;
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
        reject(reader.error);
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
