import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

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
      cursor: pointer;
      position: relative;
    }

    .file-item:last-child {
      border-bottom: none;
    }

    .file-info {
      display: flex;
      align-items: center;
      flex-grow: 1;
      min-width: 0;
      gap: 0.5rem;
    }

    .file-icon {
      flex-shrink: 0;
      color: var(--sl-color-gray-600);
      font-size: 1.25rem;
    }

    .file-icon-viewable {
      color: var(--sl-color-primary-600);
    }

    .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 1rem;
    }

    .file-name-viewable {
      color: var(--sl-color-primary-700);
    }

    .file-actions {
      flex-shrink: 0;
      z-index: 1; /* Ensure buttons stay clickable */
      display: flex;
      gap: 0.25rem;
      position: relative;
    }

    /* Expanded click areas for buttons */
    .action-area {
      position: absolute;
      top: -0.75rem; /* Match the padding of the file-item */
      bottom: -0.75rem;
      display: flex;
      align-items: center;
    }

    .action-area-download {
      right: 0;
      width: 2.5rem;
    }

    .empty-message {
      color: var(--sl-color-gray-600);
      text-align: center;
      padding: 1rem;
    }

    /* Enhance tap target for mobile */
    /* Highlight on tap/hover for clickable areas */
    .file-item:hover,
    .file-item:active {
      background-color: var(--sl-color-primary-50);
      border-radius: 0.25rem;
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
    const fileIcon = this.getFileIcon(extension);

    // Styles for viewable files
    const fileNameClass = canView
      ? "file-name file-name-viewable"
      : "file-name";
    const fileIconClass = canView
      ? "file-icon file-icon-viewable"
      : "file-icon";

    // Instead of making the whole row clickable, just make the file info area clickable
    return html`
      <div
        class="file-item"
        @click=${() => this.handleDefaultAction(filename, canView)}
        title="${canView
          ? msg("Click to view", { id: "file.clickToView" })
          : msg("Click to download", { id: "file.clickToDownload" })}"
        style="cursor: pointer;"
      >
        <div class="file-info">
          <sl-icon name="${fileIcon}" class="${fileIconClass}"></sl-icon>
          <span class="${fileNameClass}" title="${filename}">
            ${displayName}
          </span>
        </div>
        <div class="file-actions">
          ${canView
            ? html`
                <sl-button
                  size="small"
                  variant="neutral"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this.handleView(filename);
                  }}
                  title="${msg("View", { id: "file.view" })}"
                >
                  <sl-icon
                    name="eye"
                    style="font-size: 1rem; vertical-align: -0.3rem;"
                  ></sl-icon>
                </sl-button>
              `
            : ""}
          <div
            class="action-area action-area-download"
            @click=${(e: Event) => {
              e.stopPropagation();
              this.handleDownload(filename);
            }}
            title="${msg("Download", { id: "file.download" })}"
          ></div>

          <sl-button
            size="small"
            variant="neutral"
            @click=${(e: Event) => {
              e.stopPropagation();
              this.handleDownload(filename);
            }}
            title="${msg("Download", { id: "file.download" })}"
          >
            <sl-icon name="download" style="font-size: 1rem;"></sl-icon>
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

  /**
   * Handle the default action when clicking on a file item
   * For viewable files, view them. For non-viewable files, download them.
   */
  private handleDefaultAction(filename: string, canView: boolean) {
    if (canView) {
      this.handleView(filename);
    } else {
      this.handleDownload(filename);
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  private getDisplayName(filename: string): string {
    // Display just the filename if it's in a path
    return filename.split("/").pop() || filename;
  }

  private canViewFile(extension: string): boolean {
    // List of viewable file types
    const viewableExtensions = ["pdf", "jpg", "jpeg", "png", "gif", "svg"];
    // Only include DOCX for non-mobile devices
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    if (!isMobile) {
      viewableExtensions.push("docx");
    }
    return viewableExtensions.includes(extension);
  }

  private getFileIcon(extension: string): string {
    // Map file extensions to appropriate icons
    const iconMap: Record<string, string> = {
      pdf: "file-earmark-pdf",
      doc: "file-earmark-word",
      docx: "file-earmark-word",
      xls: "file-earmark-excel",
      xlsx: "file-earmark-excel",
      ppt: "file-earmark-ppt",
      pptx: "file-earmark-ppt",
      txt: "file-earmark-text",
      jpg: "file-earmark-image",
      jpeg: "file-earmark-image",
      png: "file-earmark-image",
      gif: "file-earmark-image",
      svg: "file-earmark-image",
      xml: "file-earmark-code",
      json: "file-earmark-code",
      csv: "file-earmark-spreadsheet",
    };

    return iconMap[extension] || "file-earmark";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-file-list": EdocFileList;
  }
}
