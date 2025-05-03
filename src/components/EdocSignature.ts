import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { SignatureValidationResult } from "../core/parser";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import { openLegalModal } from "../utils/legalNavigation";
import "@shoelace-style/shoelace/dist/components/details/details.js";
import "@shoelace-style/shoelace/dist/components/badge/badge.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/tooltip/tooltip.js";

/**
 * Component for displaying eDoc signature information
 */
@customElement("edoc-signature")
export class EdocSignature extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    .signature-info {
      background-color: white;
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid var(--sl-color-primary-200);
      position: relative; /* Enable absolute positioning for the status icon */
      min-height: 3.5rem; /* Ensure minimum height for smaller signature infos */
    }

    .signature-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      padding-right: 5rem; /* Increased padding to accommodate larger icon */
    }

    .signature-details {
      flex-grow: 1;
    }

    .signer-info,
    .signature-date {
      margin-bottom: 0.5rem;
    }

    /* Last child in details shouldn't have bottom margin */
    .signature-details > div:last-child {
      margin-bottom: 0;
    }

    .status-icon-container {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 4rem;
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .valid-icon-container {
      background-color: var(--sl-color-success-100);
      border: 1px solid var(--sl-color-success-300);
    }

    .invalid-icon-container {
      background-color: var(--sl-color-danger-100);
      border: 1px solid var(--sl-color-danger-300);
    }

    .status-icon {
      font-size: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .valid-icon {
      color: var(--sl-color-success-600);
    }

    .invalid-icon {
      color: var(--sl-color-danger-600);
    }

    .error-message {
      color: var(--sl-color-danger-600);
      margin-top: 0.25rem;
      font-size: 0.875rem;
      display: flex;
      align-items: flex-start;
      gap: 0.375rem;
    }

    .error-message-icon {
      color: var(--sl-color-danger-600);
      cursor: pointer;
      font-size: 1rem;
    }

    .file-list {
      max-height: 8rem;
      overflow-y: auto;
      background-color: white;
      padding: 0.5rem;
      border-radius: 0.25rem;
      border: 1px solid var(--sl-color-primary-200);
      margin-top: 0.5rem;
      list-style-type: none;
    }

    .file-list li {
      padding: 0.25rem 0;
    }

    .unsigned-files .file-list {
      border-color: var(--sl-color-danger-200);
    }

    .signed-files,
    .unsigned-files {
      margin-bottom: 0.75rem;
    }

    .unsigned-files {
      color: var(--sl-color-danger-600);
    }

    .signer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      font-weight: 500; /* Semi-bold for the main signer name */
    }

    /* Style for the ID - now inline with name */
    .signer-id {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem; /* Smaller gap between icon and text for ID */
      color: var(--sl-color-neutral-600); /* Lighter text color */
      font-size: 0.875rem; /* Slightly smaller font */
      font-weight: normal; /* Reset font weight */
      margin-left: 0.5rem; /* Space between name and ID */
    }

    .signature-date {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      color: var(--sl-color-neutral-600); /* Lighter text color */
      font-size: 0.875rem; /* Slightly smaller font */
    }

    /* Make icons for ID and date more subtle */
    .signer-id sl-icon,
    .signature-date sl-icon {
      font-size: 0.875rem; /* Smaller icons */
      color: var(--sl-color-neutral-500); /* Lighter icon color */
    }

    sl-icon {
      font-size: 1rem;
    }

    .status-icon sl-icon {
      font-size: 3rem;
    }
  `;

  /**
   * Signature validation result to display
   */
  @property({ type: Object })
  signature!: SignatureValidationResult;

  /**
   * Handle click on the info icon to open legal modal
   */
  private handleLegalModalClick(e: Event) {
    e.preventDefault();
    openLegalModal("about", "feature2_verification");
  }

  render() {
    if (!this.signature) {
      return html``;
    }

    const { valid, error } = this.signature;
    const statusTitle = valid
      ? msg("Valid signature", { id: "signatures.valid" })
      : msg("Invalid signature", { id: "signatures.invalid" }) +
        (error ? `: ${error}` : "");

    return html`
      <div class="signature-info">
        <div class="signature-header">
          <div class="signature-details">
            ${this.renderSignerInfo()} ${this.renderSignatureDate()}
          </div>
        </div>

        <!-- Status icon as a circular badge in top-right corner -->
        <sl-tooltip content="${statusTitle}">
          <div
            class="status-icon-container ${valid
              ? "valid-icon-container"
              : "invalid-icon-container"}"
            role="img"
            aria-label="${statusTitle}"
          >
            <div class="status-icon ${valid ? "valid-icon" : "invalid-icon"}">
              <sl-icon name="${valid ? "check-lg" : "x-lg"}"></sl-icon>
            </div>
          </div>
        </sl-tooltip>

        ${error
          ? html`<div class="error-message">
              <sl-tooltip
                content="${msg(
                  "Signature verification might be unreliable, more »",
                  {
                    id: "signatures.betaTagTooltip",
                  },
                )}"
              >
                <sl-icon
                  name="exclamation-square"
                  class="error-message-icon"
                  @click=${this.handleLegalModalClick}
                ></sl-icon>
              </sl-tooltip>
              ${error}
            </div>`
          : ""}
        ${this.renderFileCoverage()}
      </div>
    `;
  }

  private renderSignerInfo() {
    const { signerInfo } = this.signature;

    if (!signerInfo.signerName && !signerInfo.personalId) {
      return html``;
    }

    return html`
      <div class="signer-info">
        <sl-icon name="person" aria-hidden="true"></sl-icon>
        <span aria-label="${msg("Signed by:", { id: "signatures.signedBy" })}"
          >${signerInfo.signerName}</span
        >
        ${signerInfo.personalId
          ? html` <span class="signer-id">
              <sl-icon name="key" aria-hidden="true"></sl-icon>
              <span aria-label="ID">${signerInfo.personalId}</span>
            </span>`
          : ""}
      </div>
    `;
  }

  private renderSignatureDate() {
    const { signerInfo } = this.signature;

    if (!signerInfo.signatureDate) {
      return html``;
    }

    return html`
      <div class="signature-date">
        <sl-icon name="calendar" aria-hidden="true"></sl-icon>
        <span aria-label="${msg("Date", { id: "signatures.date" })}">
          ${signerInfo.signatureDate}
        </span>
      </div>
    `;
  }

  // The renderSignatureStatus method is no longer needed as we've integrated
  // the status icon directly in the main render method

  private renderFileCoverage() {
    const {
      allDocumentsSigned,
      originalVerificationValid,
      signedFiles,
      unsignedFiles,
    } = this.signature;

    // Only show details if not all documents are signed but signature itself is valid
    if (allDocumentsSigned || !originalVerificationValid) {
      return html``;
    }

    return html`
      <div class="file-coverage-details">
        ${signedFiles.length > 0
          ? html`
              <div class="signed-files">
                <sl-details>
                  <span slot="summary">
                    <strong
                      >${msg("Referenced files in signature", {
                        id: "signatures.referencedFiles",
                      })}
                      (${signedFiles.length})</strong
                    >
                  </span>
                  <ul class="file-list">
                    ${signedFiles.map((file) => html`<li>${file}</li>`)}
                  </ul>
                </sl-details>
              </div>
            `
          : ""}
        ${unsignedFiles.length > 0
          ? html`
              <div class="unsigned-files">
                <sl-details>
                  <span slot="summary">
                    <strong
                      >${msg("Unsigned files", {
                        id: "signatures.unsignedFiles",
                      })}
                      (${unsignedFiles.length})</strong
                    >
                    <sl-badge variant="danger" pill
                      >${unsignedFiles.length}</sl-badge
                    >
                  </span>
                  <ul class="file-list">
                    ${unsignedFiles.map((file) => html`<li>${file}</li>`)}
                  </ul>
                </sl-details>
              </div>
            `
          : ""}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-signature": EdocSignature;
  }
}
