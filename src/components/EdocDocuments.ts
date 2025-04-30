import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "./EdocFileList";

/**
 * Component for displaying document files section
 */
@customElement("edoc-documents")
export class EdocDocuments extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1.5rem;
    }

    .document-section {
      background-color: var(--sl-color-primary-100);
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid var(--sl-color-primary-200);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .section-title {
      font-weight: 600;
      font-size: 1.125rem;
      color: var(--sl-color-primary-800);
      margin: 0;
    }

    .download-all-button {
      font-size: 0.875rem;
    }
  `;

  /**
   * List of document file names
   */
  @property({ type: Array })
  files: string[] = [];

  render() {
    return html`
      <div class="document-section">
        <div class="section-header">
          <h3 class="section-title">
            ${msg("Document Files", { id: "documents.title" })}
          </h3>
          ${this.files.length > 1
            ? html`
                <sl-button
                  size="small"
                  variant="primary"
                  class="download-all-button"
                  @click=${this.handleDownloadAll}
                >
                  ${msg("Download All")}
                </sl-button>
              `
            : ""}
        </div>

        <edoc-file-list
          .files=${this.files}
          .emptyMessage=${msg("No document files found", {
            id: "documents.noDocuments",
          })}
          @file-download=${this.handleFileDownload}
          @file-view=${this.handleFileView}
        ></edoc-file-list>
      </div>
    `;
  }

  private handleFileDownload(e: CustomEvent) {
    // Stop the original event from propagating further
    e.stopPropagation();

    // Re-dispatch the event with the same data
    this.dispatchEvent(
      new CustomEvent("file-download", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleFileView(e: CustomEvent) {
    // Stop the original event from propagating further
    e.stopPropagation();

    // Re-dispatch the event with the same data
    this.dispatchEvent(
      new CustomEvent("file-view", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleDownloadAll() {
    // Dispatch a custom event to download all files
    this.dispatchEvent(
      new CustomEvent("files-download-all", {
        detail: { files: this.files },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
