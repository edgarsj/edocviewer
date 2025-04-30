import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { SignatureValidationResult } from "../core/parser";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/details/details.js";
import "@shoelace-style/shoelace/dist/components/badge/badge.js";

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
    }

    .signer-info,
    .signature-status {
      margin-bottom: 0.5rem;
    }

    .valid {
      color: var(--sl-color-success-700);
      font-weight: 600;
    }

    .invalid {
      color: var(--sl-color-danger-600);
      font-weight: 600;
    }

    .error-message {
      color: var(--sl-color-danger-600);
      margin-top: 0.25rem;
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
  `;

  /**
   * Signature validation result to display
   */
  @property({ type: Object })
  signature!: SignatureValidationResult;

  render() {
    if (!this.signature) {
      return html``;
    }

    return html`
      <div class="signature-info">
        ${this.renderSignerInfo()} ${this.renderSignatureStatus()}
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
        <strong>${msg("Signed by:", { id: "signatures.signedBy" })}</strong>
        ${signerInfo.signerName}
        ${signerInfo.personalId ? html`, ID: ${signerInfo.personalId}` : ""}
      </div>
    `;
  }

  private renderSignatureStatus() {
    const { valid, error } = this.signature;

    return html`
      <div class="signature-status">
        <strong
          >${msg("Signature Status:", {
            id: "signatures.signatureStatus",
          })}</strong
        >
        <span class="${valid ? "valid" : "invalid"}">
          ${valid
            ? msg("Valid", { id: "signatures.valid" })
            : msg("INVALID", { id: "signatures.invalid" })}
        </span>
        ${error ? html`<div class="error-message">${error}</div>` : ""}
      </div>
    `;
  }

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
