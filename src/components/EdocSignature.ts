import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { SignatureValidationResult, VerificationStatus } from "../core/parser";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import { openLegalModal } from "../utils/legalNavigation";
import "@shoelace-style/shoelace/dist/components/details/details.js";
import "@shoelace-style/shoelace/dist/components/badge/badge.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/tooltip/tooltip.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";

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

    .pending-icon-container {
      background-color: var(--sl-color-warning-100);
      border: 1px solid var(--sl-color-warning-300);
    }

    .unsupported-icon-container {
      background-color: var(--sl-color-neutral-100);
      border: 1px solid var(--sl-color-neutral-300);
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

    .pending-icon {
      color: var(--sl-color-warning-600);
    }

    .unsupported-icon {
      color: var(--sl-color-neutral-500);
    }

    .pending-icon sl-spinner {
      font-size: 2.5rem;
      --indicator-color: var(--sl-color-warning-600);
      --track-color: var(--sl-color-warning-200);
    }

    .status-line {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .status-line.failed {
      color: var(--sl-color-danger-600);
    }

    .status-line.unknown {
      color: var(--sl-color-warning-700);
    }

    .status-line.unsupported {
      color: var(--sl-color-neutral-600);
    }

    .status-line-icon {
      cursor: pointer;
      font-size: 1rem;
    }

    .details-link {
      font-size: 0.8rem;
      color: var(--sl-color-neutral-500);
      cursor: pointer;
      text-decoration: underline;
      margin-left: 0.25rem;
    }

    .details-link:hover {
      color: var(--sl-color-primary-600);
    }

    .verification-breakdown {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background-color: var(--sl-color-neutral-50);
      border-radius: 0.25rem;
      border: 1px solid var(--sl-color-neutral-200);
      font-size: 0.8rem;
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .breakdown-item:last-child {
      margin-bottom: 0;
    }

    .breakdown-item sl-icon {
      font-size: 0.875rem;
    }

    .breakdown-ok {
      color: var(--sl-color-success-600);
    }

    .breakdown-fail {
      color: var(--sl-color-danger-600);
    }

    .breakdown-unknown {
      color: var(--sl-color-warning-600);
    }

    .breakdown-pending {
      color: var(--sl-color-neutral-500);
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
   * Whether to show the verification breakdown details
   */
  @state()
  private showDetails = false;

  /**
   * Toggle showing verification details
   */
  private toggleDetails() {
    this.showDetails = !this.showDetails;
  }

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

    const { valid, error, verificationStatus, statusMessage, limitations } = this.signature;
    const isPending = verificationStatus === 'pending';
    const isUnknown = verificationStatus === 'unknown';
    const isUnsupported = verificationStatus === 'unsupported';

    // Determine status title based on verification state
    let statusTitle: string;
    if (isPending) {
      statusTitle = msg("Verifying certificate status...", { id: "signatures.verifying" });
    } else if (isUnsupported) {
      statusTitle = msg("Verification not supported on this platform", { id: "signatures.unsupported" });
    } else if (isUnknown) {
      statusTitle = msg("Could not verify certificate revocation status", { id: "signatures.unknown" });
    } else if (valid) {
      statusTitle = msg("Valid signature", { id: "signatures.valid" });
    } else {
      statusTitle = msg("Invalid signature", { id: "signatures.invalid" }) +
        (error ? `: ${error}` : "");
    }

    // Determine icon container class
    let iconContainerClass: string;
    if (isUnsupported) {
      iconContainerClass = "unsupported-icon-container";
    } else if (isPending || isUnknown) {
      iconContainerClass = "pending-icon-container";
    } else if (valid) {
      iconContainerClass = "valid-icon-container";
    } else {
      iconContainerClass = "invalid-icon-container";
    }

    // Determine icon class
    let iconClass: string;
    if (isUnsupported) {
      iconClass = "unsupported-icon";
    } else if (isPending || isUnknown) {
      iconClass = "pending-icon";
    } else if (valid) {
      iconClass = "valid-icon";
    } else {
      iconClass = "invalid-icon";
    }

    // Determine which icon to show
    let iconName: string;
    if (isUnsupported) {
      iconName = "slash-circle";
    } else if (isUnknown) {
      iconName = "question-lg";
    } else if (valid) {
      iconName = "check-lg";
    } else {
      iconName = "x-lg";
    }

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
            class="status-icon-container ${iconContainerClass}"
            role="img"
            aria-label="${statusTitle}"
          >
            <div class="status-icon ${iconClass}">
              ${isPending
                ? html`<sl-spinner></sl-spinner>`
                : html`<sl-icon name="${iconName}"></sl-icon>`}
            </div>
          </div>
        </sl-tooltip>

        ${error && !isPending
          ? html`<div class="status-line ${verificationStatus}">
              <sl-icon
                name="exclamation-square"
                class="status-line-icon"
                @click=${this.handleLegalModalClick}
              ></sl-icon>
              <span>${error}</span>
              <span class="details-link" @click=${this.toggleDetails}>
                ${msg("details", { id: "signatures.details" })}
              </span>
            </div>`
          : ""}
        ${this.renderVerificationBreakdown()}
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

  private renderVerificationBreakdown() {
    if (!this.showDetails) {
      return html``;
    }

    const { originalVerificationValid, revocation, timestamp, verificationStatus, allDocumentsSigned } = this.signature;
    const isPending = verificationStatus === 'pending';

    // Helper to get icon and class for a check
    const getCheckStatus = (passed: boolean | undefined | null, pending = false) => {
      if (pending) return { icon: 'hourglass', cls: 'breakdown-pending' };
      if (passed === true) return { icon: 'check-circle', cls: 'breakdown-ok' };
      if (passed === false) return { icon: 'x-circle', cls: 'breakdown-fail' };
      return { icon: 'question-circle', cls: 'breakdown-unknown' };
    };

    // Signature crypto check
    const cryptoStatus = getCheckStatus(originalVerificationValid);

    // Documents signed check
    const docsStatus = getCheckStatus(allDocumentsSigned);

    // Revocation check
    let revocationPassed: boolean | null = null;
    let revocationLabel = msg("Certificate revocation", { id: "signatures.revocationCheck" });
    if (revocation) {
      if (revocation.status === 'good') {
        revocationPassed = true;
        revocationLabel += ` (${revocation.method?.toUpperCase() || 'OK'})`;
      } else if (revocation.status === 'revoked') {
        revocationPassed = false;
        revocationLabel += ` (${msg("revoked", { id: "signatures.revoked" })})`;
      } else {
        revocationLabel += ` (${msg("unknown", { id: "signatures.unknownStatus" })})`;
      }
    }
    const revocationStatus = isPending
      ? getCheckStatus(null, true)
      : getCheckStatus(revocationPassed);

    // Timestamp check
    let timestampPassed: boolean | null = null;
    let timestampLabel = msg("Timestamp", { id: "signatures.timestamp" });
    if (timestamp) {
      timestampPassed = timestamp.valid;
      if (timestamp.time) {
        timestampLabel += ` (${timestamp.time})`;
      }
    }
    const timestampStatus = getCheckStatus(timestampPassed);

    return html`
      <div class="verification-breakdown">
        <div class="breakdown-item ${cryptoStatus.cls}">
          <sl-icon name="${cryptoStatus.icon}"></sl-icon>
          <span>${msg("Signature cryptography", { id: "signatures.cryptoCheck" })}</span>
        </div>
        <div class="breakdown-item ${docsStatus.cls}">
          <sl-icon name="${docsStatus.icon}"></sl-icon>
          <span>${msg("All documents signed", { id: "signatures.docsCheck" })}</span>
        </div>
        <div class="breakdown-item ${revocationStatus.cls}">
          <sl-icon name="${revocationStatus.icon}"></sl-icon>
          <span>${revocationLabel}</span>
        </div>
        <div class="breakdown-item ${timestampStatus.cls}">
          <sl-icon name="${timestampStatus.icon}"></sl-icon>
          <span>${timestampLabel}</span>
        </div>
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
