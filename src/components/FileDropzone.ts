import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/button/button.js";

export interface FileDropzoneOptions {
  acceptedFileTypes?: string[];
  suggestedFileName?: string;
}

/**
 * File dropzone component for uploading eDoc files
 * @fires file-selected - Emitted when a file is selected, with the file in the event detail
 */
@customElement("edoc-file-dropzone")
export class FileDropzone extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }

    .dropzone {
      border: 2px dashed var(--sl-color-primary-400, #6ee7b7);
      background-color: var(--sl-color-primary-50, #f6fffa);
      padding: 2rem;
      border-radius: 0.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dropzone:hover {
      background-color: var(--sl-color-primary-100, #ecfdf5);
    }

    .dropzone-active {
      background-color: var(--sl-color-primary-200, #d1fae5);
      border-color: var(--sl-color-primary-600, #10b981);
    }

    .dropzone-icon {
      color: var(--sl-color-primary-600, #10b981);
      width: 3rem;
      height: 3rem;
      margin-bottom: 0.5rem;
    }

    .dropzone-title {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }

    .dropzone-description {
      color: var(--sl-color-gray-500);
      margin-bottom: 1rem;
    }

    .suggested-file {
      margin-top: 1rem;
    }

    .suggested-file-label {
      font-size: 0.875rem;
      color: var(--sl-color-gray-600);
    }

    .suggested-file-name {
      font-weight: 500;
      color: var(--sl-color-primary-800);
    }

    input[type="file"] {
      display: none;
    }
  `;

  /**
   * Accepted file types for the input
   * @type {string[]}
   */
  @property({ type: Array })
  acceptedFileTypes: string[] = [".edoc", ".asice"];

  /**
   * Optional suggested filename to display
   * @type {string}
   */
  @property({ type: String })
  suggestedFileName?: string;

  /**
   * Whether the dropzone is in active state (drag is happening)
   * @type {boolean}
   */
  @state()
  private isActive = false;

  render() {
    return html`
      <div
        class="dropzone ${this.isActive ? "dropzone-active" : ""}"
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
        @click=${this.handleClick}
      >
        <div>
          <svg
            class="dropzone-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="dropzone-title">
            ${msg("Drop your eDoc file here", { id: "dropzone.title" })}
          </p>
          <p class="dropzone-description">
            ${msg("or click to browse files", { id: "dropzone.description" })}
          </p>
          <sl-button variant="primary"
            >${msg("Select File", { id: "dropzone.selectFile" })}</sl-button
          >
          <input
            type="file"
            @change=${this.handleFileSelection}
            accept="${this.acceptedFileTypes.join(",")}"
          />

          ${this.suggestedFileName
            ? html`
                <div class="suggested-file">
                  <p class="suggested-file-label">
                    ${msg("Suggested file:", {
                      id: "dropzone.suggestedFileLabel",
                    })}
                  </p>
                  <p class="suggested-file-name">${this.suggestedFileName}</p>
                </div>
              `
            : ""}
        </div>
      </div>
    `;
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isActive = true;
  }

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isActive = false;
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isActive = false;

    if (e.dataTransfer?.files.length) {
      this.handleFiles(e.dataTransfer.files);
    }
  }

  private handleClick() {
    const fileInput = this.shadowRoot?.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fileInput?.click();
  }

  private handleFileSelection(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  private handleFiles(files: FileList) {
    const file = files[0]; // Take the first file

    // Check file type
    const isValidType = this.validateFileType(file);
    if (!isValidType) {
      // Alert message could be replaced with a more elegant UI notification
      alert(
        `Please select a valid file type (${this.acceptedFileTypes.join(", ")})`,
      );
      return;
    }

    // Dispatch custom event with the file
    this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { file },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private validateFileType(file: File): boolean {
    if (!this.acceptedFileTypes || this.acceptedFileTypes.length === 0) {
      return true;
    }

    return this.acceptedFileTypes.some((type) =>
      file.name.toLowerCase().endsWith(type),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-file-dropzone": FileDropzone;
  }
}
