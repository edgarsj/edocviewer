// src/components/EdocFilePreview.ts

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";

// Import Shoelace components
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import { SlDialog } from "@shoelace-style/shoelace";

// We'll import our docx adapter dynamically when needed
// import { renderDocx } from "../utils/docxAdapter";

/**
 * Component for previewing files in a modal dialog
 */
@customElement("edoc-file-preview")
export class EdocFilePreview extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }

    /* Base dialog styles for all devices */
    sl-dialog::part(panel) {
      width: 100vw;
      height: 100vh;
      max-width: 100vw !important;
      max-height: 100vh;
      margin: 0;
      border-radius: 0;
      /* Fix for mobile browsers */
      position: fixed;
      top: 0;
      left: 0;
    }

    /* Mobile specific adjustments */
    @media (max-width: 767px) {
      sl-dialog::part(panel) {
        height: calc(100vh - 48px);
        max-height: calc(100vh - 48px) !important;
      }
    }

    /* Remove header */
    sl-dialog::part(header) {
      display: none;
    }

    /* Make body fill available space */
    sl-dialog::part(body) {
      height: calc(100vh - 3rem);
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Adjust for mobile */
    @media (max-width: 767px) {
      sl-dialog::part(body) {
        height: calc(100vh - 48px - 3rem); /* Mobile nav + footer */
      }
    }

    /* Fix footer height and styling */
    sl-dialog::part(footer) {
      padding: 1rem;
      min-height: 3rem;
      background-color: var(
        --sl-color-primary-100
      ); /* More visible background */
      border-top: 1px solid var(--sl-color-primary-300);
      position: relative; /* Keep normal flow */
      z-index: 100; /* High z-index */
    }

    /* Footer container to properly align buttons */
    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    /* Action buttons in footer */
    .footer-actions {
      display: flex;
      gap: 1rem;
    }

    .preview-container {
      width: 100%;
      height: 100%;
      position: relative;
      background-color: var(--sl-color-gray-100);
      overflow: auto;
    }

    .image-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .pdf-container {
      width: 100%;
      height: 100%;
    }

    .pdf-container iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* PDF mobile message container */
    .pdf-mobile-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 2rem;
      text-align: center;
    }

    .pdf-icon {
      margin-bottom: 1.5rem;
    }

    .pdf-message {
      margin-bottom: 1.5rem;
      color: var(--sl-color-gray-700);
      font-size: 1rem;
      max-width: 80%;
    }

    /* Custom close button in top-right corner */
    .preview-close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 100;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .file-title-container {
      position: absolute;
      top: 1rem;
      left: 1rem;
      max-width: calc(100% - 6rem);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-title {
      background: rgba(255, 255, 255, 0.8);
      padding: 0.5rem 0.75rem;
      border-radius: 0.25rem;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .error-message {
      padding: 2rem;
      text-align: center;
      color: var(--sl-color-danger-600);
    }

    /* Loading spinner overlay */
    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 50;
    }

    .loading-text {
      margin-top: 1rem;
      color: var(--sl-color-primary-600);
      font-weight: 500;
    }

    /* Additional styles for DOCX preview */
    .docx-container {
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: var(--sl-color-gray-100);
      position: relative;
    }

    /* Style the docx-preview elements */
    :host ::part(docx-preview) {
      padding: 1rem;
      background-color: white;
    }

    :host ::part(docx-wrapper) {
      margin: 0 auto;
    }

    /* Hide elements when needed */
    .hidden {
      display: none !important;
    }
  `;

  /**
   * The file data to preview
   */
  @property({ type: Object })
  fileData?: Uint8Array;

  /**
   * The file name
   */
  @property({ type: String })
  fileName: string = "";

  /**
   * The MIME type of the file
   */
  @property({ type: String })
  mimeType: string = "";

  /**
   * Store the dialog element for direct access
   */
  @state() private dialog?: SlDialog;

  /**
   * Track whether the preview is open
   */
  @state() private isOpen: boolean = false;

  /**
   * Store object URL for cleanup
   */
  @state() private objectUrl: string = "";

  /**
   * Track loading state (for DOCX loading)
   */
  @state() private isLoading: boolean = false;

  /**
   * Check if device is mobile
   */
  @state() private isMobile: boolean = false;

  constructor() {
    super();
    // Detect mobile device
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
  }

  firstUpdated() {
    this.dialog = this.shadowRoot?.querySelector("sl-dialog") as SlDialog;
  }

  /**
   * Show the preview dialog
   */
  public show() {
    this.isOpen = true;
    if (this.dialog) {
      this.dialog.show();
    }

    // For DOCX files, we need to wait for dialog to open before rendering
    if (this.getFileExtension(this.fileName) === "docx") {
      this.isLoading = true;
      setTimeout(() => this.renderDocxContent(), 100);
    }
  }

  /**
   * Hide the preview dialog
   */
  public hide() {
    this.isOpen = false;
    if (this.dialog) {
      this.dialog.hide();
    }
    this.cleanupUrl();
  }

  /**
   * Clean up object URL when done
   */
  private cleanupUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = "";
    }
  }

  /**
   * Handle after hide event from dialog
   */
  private handleAfterHide() {
    this.isOpen = false;
    this.cleanupUrl();
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  /**
   * Handle download of the current file
   */
  private handleDownload() {
    if (this.fileData && this.fileName) {
      const blob = new Blob([this.fileData], { type: this.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = this.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Dynamically render DOCX content
   */
  private async renderDocxContent() {
    if (!this.fileData) return;

    try {
      this.isLoading = true;

      // First get the container from the shadow DOM
      const container = this.shadowRoot?.querySelector(
        ".docx-container",
      ) as HTMLElement;
      if (!container) {
        throw new Error("DOCX container not found in shadow DOM");
      }

      // Dynamically import the docx adapter (which in turn dynamically imports docx-preview)
      const docxAdapter = await import("../utils/docxAdapter");

      // Render the DOCX file
      await docxAdapter.renderDocx(this.fileData, container);
    } catch (error) {
      console.error("Error rendering DOCX:", error);

      // Show error message in container
      const container = this.shadowRoot?.querySelector(".docx-container");
      if (container) {
        container.innerHTML = `
          <div class="error-message">
            ${msg(
              "Error rendering DOCX file. The file may be corrupted or not supported.",
              {
                id: "preview.docxError",
              },
            )}
          </div>
        `;
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render content based on file type
   */
  private renderContent() {
    if (!this.fileData) {
      return html`<div class="error-message">
        ${msg("No file data available", { id: "preview.noData" })}
      </div>`;
    }

    const extension = this.getFileExtension(this.fileName);
    const isImage = /^(jpg|jpeg|png|gif|svg)$/i.test(extension);
    const isPdf = /^pdf$/i.test(extension);
    const isDocx = /^docx$/i.test(extension);

    // Create blob and object URL for images and PDFs
    if (isImage || isPdf) {
      const blob = new Blob([this.fileData], { type: this.mimeType });
      this.objectUrl = URL.createObjectURL(blob);
    }

    if (isImage) {
      return this.renderImage();
    } else if (isPdf) {
      // For PDFs, check if on mobile and render appropriate view
      if (this.isMobile) {
        return this.renderPdfMobile();
      } else {
        return this.renderPdf();
      }
    } else if (isDocx) {
      return this.renderDocx();
    } else {
      return html`<div class="error-message">
        ${msg("Unsupported file type for preview", {
          id: "preview.unsupportedType",
        })}
      </div>`;
    }
  }

  /**
   * Render image preview
   */
  private renderImage() {
    return html`
      <div class="image-container">
        <img src="${this.objectUrl}" alt="${this.fileName}" />
      </div>
    `;
  }

  /**
   * Render PDF preview (desktop)
   */
  private renderPdf() {
    return html`
      <div class="pdf-container">
        <iframe src="${this.objectUrl}" frameborder="0"></iframe>
      </div>
    `;
  }

  /**
   * Render PDF mobile message instead of preview
   */
  private renderPdfMobile() {
    return html`
      <div class="pdf-mobile-container">
        <div class="pdf-icon">
          <sl-icon
            name="file-earmark-pdf"
            style="font-size: 4rem; color: var(--sl-color-danger-600);"
          ></sl-icon>
        </div>
        <p class="pdf-message">
          ${msg("PDF preview is not available on mobile devices", {
            id: "preview.pdfMobileUnsupported",
          })}
        </p>
        <sl-button
          variant="primary"
          @click=${() => window.open(this.objectUrl, "_blank")}
        >
          ${msg("Open PDF", { id: "preview.openPdf" })}
        </sl-button>
      </div>
    `;
  }

  /**
   * Render DOCX preview
   */
  private renderDocx() {
    return html`
      <div class="docx-container"></div>
      ${this.isLoading ? this.renderLoading() : nothing}
    `;
  }

  /**
   * Render loading spinner
   */
  private renderLoading() {
    return html`
      <div class="loading-container">
        <sl-spinner style="font-size: 2rem;"></sl-spinner>
        <div class="loading-text">
          ${msg("Loading document...", { id: "preview.loading" })}
        </div>
      </div>
    `;
  }

  render() {
    const fileExtension = this.getFileExtension(this.fileName);
    const showOpenInNewTab =
      !this.isMobile && fileExtension !== "pdf" && fileExtension !== "docx"; // Added docx to exclusion

    return html`
      <sl-dialog
        ?open=${this.isOpen}
        @sl-after-hide=${this.handleAfterHide}
        no-header
      >
        <div class="preview-container">
          <div class="file-title-container">
            <div class="file-title" title="${this.fileName}">
              ${this.fileName}
            </div>
          </div>

          <sl-icon-button
            class="preview-close-button"
            name="x-lg"
            label=${msg("Close", { id: "legal.close_button" })}
            @click=${this.hide}
          ></sl-icon-button>

          ${this.renderContent()}
        </div>

        <div slot="footer">
          <div class="footer-container">
            <sl-button size="small" @click=${this.hide}>
              ${msg("Close", { id: "legal.close_button" })}
            </sl-button>

            <div class="footer-actions">
              <sl-button size="small" @click=${this.handleDownload}>
                <sl-icon
                  name="download"
                  slot="prefix"
                  style="font-size: 1rem;"
                ></sl-icon>
                ${msg("Download", { id: "file.download" })}
              </sl-button>

              ${showOpenInNewTab
                ? html`
                    <sl-button
                      size="small"
                      variant="primary"
                      @click=${() => window.open(this.objectUrl, "_blank")}
                    >
                      <sl-icon
                        name="box-arrow-up-right"
                        slot="prefix"
                        style="font-size: 1rem;"
                      ></sl-icon>
                      ${msg("Open in New Tab", { id: "preview.openInNewTab" })}
                    </sl-button>
                  `
                : ""}
            </div>
          </div>
        </div>
      </sl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-file-preview": EdocFilePreview;
  }
}
