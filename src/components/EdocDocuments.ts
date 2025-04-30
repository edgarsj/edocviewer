import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import "./EdocFileList";

/**
 * Component for displaying document files section
 */
@customElement("edoc-documents")
export class EdocDocuments extends LitElement {
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

    .section-title {
      font-weight: 600;
      margin-bottom: 0.75rem;
      font-size: 1.125rem;
      color: var(--sl-color-primary-800);
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
        <h3 class="section-title">
          ${msg("Document Files", { id: "documents.title" })}
        </h3>

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
    // Re-dispatch the event up to parent components
    this.dispatchEvent(
      new CustomEvent("file-download", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleFileView(e: CustomEvent) {
    // Re-dispatch the event up to parent components
    this.dispatchEvent(
      new CustomEvent("file-view", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-documents": EdocDocuments;
  }
}
