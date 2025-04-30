import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/button/button.js";

/**
 * Component for displaying a list of files in the eDoc container
 * @fires file-download - Custom event when a file is requested for download
 * @fires file-view - Custom event when a file is requested for viewing
 */
@customElement("edoc-file-list")
export class EdocFileList extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }

    .files {
      background-color: white;
      border: 1px solid var(--sl-color-primary-200);
      border-radius: 0.375rem;
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--sl-color-primary-200);
    }

    .file-item:last-child {
      border-bottom: none;
    }

    .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 1rem;
    }

    .file-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .empty-message {
      color: var(--sl-color-gray-600);
      text-align: center;
      padding: 1rem;
    }
  `;

  /**
   * List of file names to display
   */
  @property({ type: Array })
  files: string[] = [];

  /**
   * Empty state message to display when no files are present
   */
  @property({ type: String })
  emptyMessage = msg("No files found");

  render() {
    return html`
      <div class="files">
        ${this.files.length === 0
          ? html`<div class="empty-message">${this.emptyMessage}</div>`
          : this.files.map((file) => this.renderFileItem(file))}
      </div>
    `;
  }

  private renderFileItem(filename: string) {
    const extension = this.getFileExtension(filename);
    const displayName = this.getDisplayName(filename);
    const canView = this.canViewFile(extension);

    return html`
      <div class="file-item">
        <span class="file-name" title="${filename}">${displayName}</span>
        <div class="file-actions">
          ${canView
            ? html`
                <sl-button
                  size="small"
                  @click=${() => this.handleView(filename)}
                >
                  ${msg("View", { id: "file.view" })}
                </sl-button>
              `
            : ""}

          <sl-button
            size="small"
            variant="primary"
            @click=${() => this.handleDownload(filename)}
          >
            ${msg("Download", { id: "file.download" })}
          </sl-button>
        </div>
      </div>
    `;
  }

  private handleDownload(filename: string) {
    console.log(`Requesting download for: ${filename}`);
    this.dispatchEvent(
      new CustomEvent("file-download", {
        detail: { filename },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleView(filename: string) {
    console.log(`Requesting view for: ${filename}`);
    this.dispatchEvent(
      new CustomEvent("file-view", {
        detail: { filename },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  private getDisplayName(filename: string): string {
    // Display just the filename if it's in a path
    return filename.split("/").pop() || filename;
  }

  private canViewFile(extension: string): boolean {
    // Currently only PDFs are viewable
    return extension === "pdf";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-file-list": EdocFileList;
  }
}
