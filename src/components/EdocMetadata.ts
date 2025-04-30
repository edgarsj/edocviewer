import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import "@shoelace-style/shoelace/dist/components/details/details.js";
import "./EdocFileList";

/**
 * Component for displaying metadata files in an expandable section
 */
@customElement("edoc-metadata")
export class EdocMetadata extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1.5rem;
    }

    .metadata-section {
      background-color: var(--sl-color-primary-100);
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid var(--sl-color-primary-200);
    }

    sl-details::part(base) {
      background-color: transparent;
      border: none;
    }

    sl-details::part(header) {
      padding: 0;
    }

    sl-details::part(summary) {
      font-weight: 500;
      color: var(--sl-color-primary-800);
    }

    sl-details::part(content) {
      padding: 1rem 0 0 0;
    }
  `;

  /**
   * List of metadata file names
   */
  @property({ type: Array })
  files: string[] = [];

  render() {
    if (this.files.length === 0) {
      return html``;
    }

    return html`
      <div class="metadata-section">
        <sl-details>
          <span slot="summary"
            >${msg("Metadata Files (Advanced)", { id: "metadata.title" })}</span
          >

          <edoc-file-list
            .files=${this.files}
            .emptyMessage=${msg("No metadata files found", {
              id: "metadata.noMetadata",
            })}
            @file-download=${this.handleFileDownload}
          ></edoc-file-list>
        </sl-details>
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
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-metadata": EdocMetadata;
  }
}
