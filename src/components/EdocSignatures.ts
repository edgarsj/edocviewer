import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import { SignatureValidationResult } from "../core/parser";
import "./EdocSignature";

/**
 * Component for displaying all signatures section
 */
@customElement("edoc-signatures")
export class EdocSignatures extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1.5rem;
    }

    .signature-section {
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

    .no-signatures {
      color: var(--sl-color-gray-600);
    }
  `;

  /**
   * Array of signature validation results
   */
  @property({ type: Array })
  signatures: SignatureValidationResult[] = [];

  render() {
    return html`
      <div class="signature-section">
        <h3 class="section-title">
          ${msg("Signatures", { id: "signatures.title" })}
        </h3>

        ${this.signatures.length === 0
          ? html`<p class="no-signatures">
              ${msg("No signatures found", { id: "signatures.noSignatures" })}
            </p>`
          : this.signatures.map(
              (signature) => html`
                <edoc-signature .signature=${signature}></edoc-signature>
              `,
            )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-signatures": EdocSignatures;
  }
}
