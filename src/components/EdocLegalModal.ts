import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";

// Import Shoelace components
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/tab/tab.js";
import "@shoelace-style/shoelace/dist/components/tab-group/tab-group.js";
import "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js";
import { SlDialog } from "@shoelace-style/shoelace";

/**
 * Legal information modal component for the eDoc Viewer
 */
@customElement("edoc-legal-modal")
export class EdocLegalModal extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }

    .legal-content {
      padding: 0 0.5rem;
    }

    h2 {
      color: var(--sl-color-primary-700);
      font-size: 1.5rem;
      margin-top: 0;
    }

    h3 {
      color: var(--sl-color-primary-600);
      font-size: 1.25rem;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin: 0.75rem 0;
    }

    ul,
    ol {
      margin: 0.75rem 0;
      padding-left: 1.5rem;
    }

    a {
      color: var(--sl-color-primary-600);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .anchor-link {
      position: relative;
      top: -80px;
      visibility: hidden;
    }

    /* For small screens adjust dialog width */
    @media (max-width: 640px) {
      sl-dialog::part(panel) {
        width: 100%;
        max-width: calc(100% - 2rem);
      }
    }
  `;

  // The dialog element reference
  @state() private dialog?: SlDialog;

  // The active tab, which can be set from the outside
  @property({ type: String }) activeTab: "terms" | "privacy" | "disclaimer" =
    "terms";

  // The anchor to scroll to after opening
  @property({ type: String }) anchor?: string;

  firstUpdated() {
    this.dialog = this.shadowRoot?.querySelector("sl-dialog") as SlDialog;
  }

  open() {
    if (this.dialog) {
      this.dialog.show();

      // Set active tab based on property
      const tabGroup = this.shadowRoot?.querySelector("sl-tab-group");
      if (tabGroup) {
        tabGroup.setAttribute("active", this.activeTab);
      }

      // If an anchor is provided, scroll to it after dialog is shown
      if (this.anchor) {
        // Need to wait for dialog to be fully rendered
        setTimeout(() => {
          const element = this.shadowRoot?.querySelector(`#${this.anchor}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }

  close() {
    if (this.dialog) {
      this.dialog.hide();
      // Check if the URL has a hash for a legal section
      const hash = window.location.hash.slice(1);
      if (
        ["terms", "privacy", "disclaimer"].includes(hash) ||
        hash.match(/^(terms|privacy|disclaimer)-(.+)$/)
      ) {
        // Remove the hash without page reload
        history.pushState(null, "", window.location.pathname);
      }
    }
  }

  // Handle tab change
  handleTabChange(e: CustomEvent) {
    this.activeTab = e.detail.name;

    // If there's an anchor, try to scroll to it
    if (this.anchor && this.activeTab) {
      setTimeout(() => {
        const element = this.shadowRoot?.querySelector(`#${this.anchor}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          this.anchor = undefined; // Clear anchor after using it
        }
      }, 100);
    }
  }

  render() {
    return html`
      <sl-dialog
        label="${msg("Legal Information", { id: "legal.title" })}"
        @sl-after-hide=${() => this.close()}
      >
        <sl-tab-group @sl-tab-show=${this.handleTabChange}>
          <sl-tab slot="nav" panel="terms" name="terms">
            ${msg("Terms of Service", { id: "legal.terms_tab" })}
          </sl-tab>
          <sl-tab slot="nav" panel="privacy" name="privacy">
            ${msg("Privacy Policy", { id: "legal.privacy_tab" })}
          </sl-tab>
          <sl-tab slot="nav" panel="disclaimer" name="disclaimer">
            ${msg("Disclaimers", { id: "legal.disclaimer_tab" })}
          </sl-tab>

          <sl-tab-panel name="terms">
            <div class="legal-content">
              <h2>${msg("Terms of Service", { id: "legal.terms_title" })}</h2>

              <span id="terms-effective" class="anchor-link"></span>
              <h3>
                ${msg("1. Effective Date", {
                  id: "legal.terms_effective_title",
                })}
              </h3>
              <p>
                ${msg(
                  "These Terms of Service are effective as of May 1, 2025.",
                  { id: "legal.terms_effective_content" },
                )}
              </p>

              <span id="terms-acceptance" class="anchor-link"></span>
              <h3>
                ${msg("2. Acceptance of Terms", {
                  id: "legal.terms_acceptance_title",
                })}
              </h3>
              <p>
                ${msg(
                  "By using the eDoc Viewer application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.",
                  { id: "legal.terms_acceptance_content" },
                )}
              </p>

              <span id="terms-description" class="anchor-link"></span>
              <h3>
                ${msg("3. Service Description", {
                  id: "legal.terms_description_title",
                })}
              </h3>
              <p>
                ${msg(
                  "eDoc Viewer is a web application that allows users to view and verify EU standard ASiC-E and Latvian eDoc electronic signature files (.asice, .edoc). The application processes files locally in your browser and does not upload your documents to any server.",
                  { id: "legal.terms_description_content" },
                )}
              </p>

              <span id="terms-usage" class="anchor-link"></span>
              <h3>
                ${msg("4. Acceptable Use", { id: "legal.terms_usage_title" })}
              </h3>
              <p>
                ${msg(
                  "You agree to use eDoc Viewer only for lawful purposes and in accordance with these Terms. You may not use the application in any way that violates applicable laws or regulations.",
                  { id: "legal.terms_usage_content" },
                )}
              </p>

              <span id="terms-modifications" class="anchor-link"></span>
              <h3>
                ${msg("5. Modifications to Service", {
                  id: "legal.terms_modifications_title",
                })}
              </h3>
              <p>
                ${msg(
                  "We reserve the right to modify or discontinue the eDoc Viewer service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.",
                  { id: "legal.terms_modifications_content" },
                )}
              </p>

              <span id="terms-opensource" class="anchor-link"></span>
              <h3>
                ${msg("6. Open Source Software", {
                  id: "legal.terms_opensource_title",
                })}
              </h3>
              <p>
                ${msg(
                  "eDoc Viewer is open source software licensed under the MIT License. You are free to use, modify, and distribute the software in accordance with the terms of the MIT License.",
                  { id: "legal.terms_opensource_content" },
                )}
              </p>
              <p>
                ${msg("The source code is available at: ", {
                  id: "legal.terms_source_code",
                })}
                <a href="https://github.com/edgarsj/edocviewer" target="_blank"
                  >GitHub</a
                >
              </p>
            </div>
          </sl-tab-panel>

          <sl-tab-panel name="privacy">
            <div class="legal-content">
              <h2>${msg("Privacy Policy", { id: "legal.privacy_title" })}</h2>

              <span id="privacy-data" class="anchor-link"></span>
              <h3>
                ${msg("1. Data Processing", { id: "legal.privacy_data_title" })}
              </h3>
              <p>
                ${msg(
                  "eDoc Viewer processes all files locally in your browser. Your documents are never uploaded to our servers or stored anywhere outside of your device.",
                  { id: "legal.privacy_data_content" },
                )}
              </p>

              <span id="privacy-analytics" class="anchor-link"></span>
              <h3>
                ${msg("2. Analytics", { id: "legal.privacy_analytics_title" })}
              </h3>
              <p>
                ${msg(
                  "We use Plausible Analytics, a privacy-friendly analytics service, to collect anonymous usage data. This data helps us improve the application but cannot be used to identify individual users. No personal information is collected, and no cookies are used for tracking purposes.",
                  { id: "legal.privacy_analytics_content" },
                )}
              </p>
              <p>
                ${msg(
                  "Analytics are only enabled in the web version. The Progressive Web App (PWA) version does not include any analytics.",
                  { id: "legal.privacy_analytics_pwa" },
                )}
              </p>

              <span id="privacy-cookies" class="anchor-link"></span>
              <h3>
                ${msg("3. Local Storage", {
                  id: "legal.privacy_cookies_title",
                })}
              </h3>
              <p>
                ${msg(
                  "eDoc Viewer uses your browser's localStorage feature only to save your language preferences and application settings. No third-party cookies are used.",
                  { id: "legal.privacy_cookies_content" },
                )}
              </p>

              <span id="privacy-pwa" class="anchor-link"></span>
              <h3>
                ${msg("4. PWA Installation", { id: "legal.privacy_pwa_title" })}
              </h3>
              <p>
                ${msg(
                  "When installed as a Progressive Web App (PWA), eDoc Viewer stores the application files on your device for offline use. You can uninstall the PWA at any time through your browser or operating system settings.",
                  { id: "legal.privacy_pwa_content" },
                )}
              </p>

              <span id="privacy-thirdparty" class="anchor-link"></span>
              <h3>
                ${msg("5. Third-Party Services", {
                  id: "legal.privacy_thirdparty_title",
                })}
              </h3>
              <p>
                ${msg(
                  "The application may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites.",
                  { id: "legal.privacy_thirdparty_content" },
                )}
              </p>
            </div>
          </sl-tab-panel>

          <sl-tab-panel name="disclaimer">
            <div class="legal-content">
              <h2>${msg("Disclaimers", { id: "legal.disclaimer_title" })}</h2>

              <span id="disclaimer-warranty" class="anchor-link"></span>
              <h3>
                ${msg("1. No Warranty", {
                  id: "legal.disclaimer_warranty_title",
                })}
              </h3>
              <p>
                ${msg(
                  'eDoc Viewer is provided "as is" and "as available" without any warranty of any kind. We do not guarantee that the application will be error-free or uninterrupted.',
                  { id: "legal.disclaimer_warranty_content" },
                )}
              </p>

              <span id="disclaimer-liability" class="anchor-link"></span>
              <h3>
                ${msg("2. Limitation of Liability", {
                  id: "legal.disclaimer_liability_title",
                })}
              </h3>
              <p>
                ${msg(
                  "In no event shall the eDoc Viewer team be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the application.",
                  { id: "legal.disclaimer_liability_content" },
                )}
              </p>

              <span id="disclaimer-verification" class="anchor-link"></span>
              <h3>
                ${msg("3. Signature Verification", {
                  id: "legal.disclaimer_verification_title",
                })}
              </h3>
              <p>
                ${msg(
                  "While eDoc Viewer attempts to accurately verify electronic signatures, we recommend using official tools provided by governmental agencies for legally binding verification. eDoc Viewer should be considered a convenience tool rather than an authoritative verification source.",
                  { id: "legal.disclaimer_verification_content" },
                )}
              </p>

              <span id="disclaimer-security" class="anchor-link"></span>
              <h3>
                ${msg("4. Security Considerations", {
                  id: "legal.disclaimer_security_title",
                })}
              </h3>
              <p>
                ${msg(
                  "Although we process files locally in your browser for privacy reasons, this may not provide the same level of security as server-side processing in all cases. Please ensure your device and browser are up-to-date and secure when handling sensitive documents.",
                  { id: "legal.disclaimer_security_content" },
                )}
              </p>

              <span id="disclaimer-opensource" class="anchor-link"></span>
              <h3>
                ${msg("5. Open Source Software", {
                  id: "legal.disclaimer_opensource_title",
                })}
              </h3>
              <p>
                ${msg(
                  'eDoc Viewer uses various open source software components, each with its own license. These components are provided "as is" by their respective authors.',
                  { id: "legal.disclaimer_opensource_content" },
                )}
              </p>
            </div>
          </sl-tab-panel>
        </sl-tab-group>

        <div slot="footer">
          <sl-button @click=${() => this.close()}>
            ${msg("Close", { id: "legal.close_button" })}
          </sl-button>
        </div>
      </sl-dialog>
    `;
  }
}
