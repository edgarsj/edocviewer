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

    .hidden {
      display: none !important;
    }
  `;

  @state() private view: "upload" | "result" = "upload";
  @state() private currentYear = new Date().getFullYear();
  @state() private container: any = null;
  @state() private signatures: any[] = [];
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
            <h1 class="app-title">${msg("eDoc Viewer")}</h1>
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
                        ></edoc-documents>
                        <edoc-metadata
                          .files=${this.container.metadataFileList || []}
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

    try {
      // This is where you would normally process the file
      // For the stub, we'll just simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate container and signatures (only in stub version)
      this.container = {
        documentFileList: ["document.pdf"],
        metadataFileList: ["metadata.xml"],
      };

      this.signatures = [
        {
          signerInfo: {
            signerName: "Test User",
            personalId: "000000-00000",
          },
          valid: true,
          error: null,
          allDocumentsSigned: true,
          signedFiles: ["document.pdf"],
          unsignedFiles: [],
          originalVerificationValid: true,
        },
      ];
    } catch (error) {
      this.error = `Error processing file: ${(error as Error).message}`;
      console.error("File processing error:", error);
    } finally {
      this.loading = false;
    }
  }

  private goBack() {
    // Reset state and go back to upload view
    this.view = "upload";
    this.container = null;
    this.signatures = [];
    this.error = "";
  }
}
