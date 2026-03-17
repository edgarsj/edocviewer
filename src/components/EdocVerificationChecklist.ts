import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { ChecklistItemResult, TrustListMatchResult, CertificateIssuerInfo } from "../core/parser";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import { SlDialog } from "@shoelace-style/shoelace";

@customElement("edoc-verification-checklist")
export class EdocVerificationChecklist extends LocaleAwareMixin(LitElement) {
  static styles = css`
    .checklist-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.625rem 0;
      border-bottom: 1px solid var(--sl-color-neutral-100);
    }

    .checklist-item:last-child {
      border-bottom: none;
    }

    .checklist-icon {
      flex-shrink: 0;
      font-size: 1.125rem;
      margin-top: 0.0625rem;
    }

    .checklist-icon.pass {
      color: var(--sl-color-success-600);
    }

    .checklist-icon.fail {
      color: var(--sl-color-danger-600);
    }

    .checklist-icon.indeterminate {
      color: var(--sl-color-warning-600);
    }

    .checklist-icon.skipped {
      color: var(--sl-color-neutral-400);
    }

    .checklist-content {
      flex: 1;
      min-width: 0;
    }

    .checklist-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--sl-color-neutral-800);
    }

    .checklist-detail {
      font-size: 0.8rem;
      color: var(--sl-color-neutral-500);
      margin-top: 0.25rem;
    }

    .checklist-country {
      font-size: 0.75rem;
      color: var(--sl-color-neutral-400);
      margin-top: 0.125rem;
    }

    .trust-section {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--sl-color-neutral-200);
    }

    .trust-section-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--sl-color-neutral-600);
      margin-bottom: 0.5rem;
    }

    .trust-match {
      font-size: 0.8rem;
      color: var(--sl-color-neutral-600);
      padding: 0.5rem;
      background: var(--sl-color-neutral-50);
      border-radius: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .trust-match .confidence {
      font-weight: 500;
    }

    sl-dialog::part(panel) {
      max-width: 500px;
    }

    sl-dialog::part(body) {
      padding-top: 0;
    }
  `;

  @property({ type: Array })
  checklist: ChecklistItemResult[] = [];

  @property({ type: Object })
  trustListMatch?: TrustListMatchResult;

  @property({ type: Object })
  timestampTrustListMatch?: TrustListMatchResult;

  @property({ type: String })
  signerName = "";

  @property({ type: Object })
  issuer?: CertificateIssuerInfo;

  public show() {
    const dialog = this.shadowRoot?.querySelector("sl-dialog") as SlDialog;
    dialog?.show();
  }

  public hide() {
    const dialog = this.shadowRoot?.querySelector("sl-dialog") as SlDialog;
    dialog?.hide();
  }

  private getStatusIcon(status: string): { name: string; cls: string } {
    switch (status) {
      case "pass":
        return { name: "check-circle-fill", cls: "pass" };
      case "fail":
        return { name: "x-circle-fill", cls: "fail" };
      case "indeterminate":
        return { name: "question-circle-fill", cls: "indeterminate" };
      case "skipped":
        return { name: "dash-circle", cls: "skipped" };
      default:
        return { name: "question-circle", cls: "indeterminate" };
    }
  }

  render() {
    const title = this.signerName
      ? `${msg("Verification details", { id: "checklist.title" })} — ${this.signerName}`
      : msg("Verification details", { id: "checklist.title" });

    return html`
      <sl-dialog label="${title}">
        ${this.checklist.map((item) => {
          const icon = this.getStatusIcon(item.status);
          return html`
            <div class="checklist-item">
              <sl-icon
                name="${icon.name}"
                class="checklist-icon ${icon.cls}"
              ></sl-icon>
              <div class="checklist-content">
                <div class="checklist-label">${item.label}</div>
                ${item.detail
                  ? html`<div class="checklist-detail">${item.detail}</div>`
                  : nothing}
                ${item.country
                  ? html`<div class="checklist-country">${item.country}</div>`
                  : nothing}
              </div>
            </div>
          `;
        })}
        ${this.renderTrustInfo()}
      </sl-dialog>
    `;
  }

  private renderTrustInfo() {
    if (!this.trustListMatch && !this.timestampTrustListMatch && !this.issuer) {
      return nothing;
    }

    const issuerLabel = this.issuer
      ? [this.issuer.commonName, this.issuer.organization, this.issuer.country]
          .filter(Boolean)
          .join(", ")
      : null;

    return html`
      <div class="trust-section">
        <div class="trust-section-title">
          ${msg("Trust list details", { id: "checklist.trustDetails" })}
        </div>
        ${issuerLabel
          ? html`<div class="trust-match">
              <strong>${msg("Certificate issuer", { id: "checklist.certIssuer" })}:</strong>
              ${issuerLabel}
            </div>`
          : nothing}
        ${this.trustListMatch
          ? this.renderTrustMatch(
              msg("Signer issuer", { id: "checklist.signerIssuer" }),
              this.trustListMatch
            )
          : nothing}
        ${this.timestampTrustListMatch
          ? this.renderTrustMatch(
              msg("Timestamp authority", { id: "checklist.timestampAuthority" }),
              this.timestampTrustListMatch
            )
          : nothing}
      </div>
    `;
  }

  private renderTrustMatch(label: string, match: TrustListMatchResult) {
    return html`
      <div class="trust-match">
        <strong>${label}:</strong>
        ${match.found
          ? html`${match.trustedAtTime ? "Trusted" : "Not trusted"}
              ${match.confidence
                ? html`(<span class="confidence">${match.confidence}</span>)`
                : nothing}
              ${match.country ? html`— ${match.country}` : nothing}`
          : "Not found in trusted list"}
        ${match.detail ? html`<div>${match.detail}</div>` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-verification-checklist": EdocVerificationChecklist;
  }
}
