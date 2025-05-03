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
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
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

    li {
      margin-bottom: 0.5rem;
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

    /* Make dialog wider to match main content width */
    sl-dialog::part(panel) {
      width: 100%;
      max-width: 800px; /* Match the max-width of edoc-container */
      position: relative;
    }

    /* Hide the header completely */
    sl-dialog::part(header) {
      display: none;
    }

    /* Custom close button styling */
    .custom-close-button {
      position: absolute;
      top: 0.75rem;
      right: 1rem;
      z-index: 100;
      border: none;
      background: transparent;
      cursor: pointer;
    }

    /* Make sure the tab group fills the available space */
    sl-tab-group {
      width: 100%;
      margin-top: 0;
      padding-top: 0.5rem;
    }

    /* Remove any extra space at the top */
    sl-dialog::part(body) {
      padding-top: 0;
    }

    /* Ensure the dialog panel has correct spacing */
    sl-dialog::part(panel) {
      padding-top: 0.5rem;
    }

    /* Special icons for about section */
    .feature-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .feature-list sl-icon {
      flex-shrink: 0;
      font-size: 1.25rem;
      margin-top: 0.15rem;
      color: var(--sl-color-primary-600);
    }

    /* For small screens adjust dialog width */
    @media (max-width: 850px) {
      sl-dialog::part(panel) {
        width: 100%;
        max-width: calc(100% - 2rem);
      }
    }
  `;

  // The dialog element reference
  @state() private dialog?: SlDialog;

  // The active tab, which can be set from the outside
  @property({ type: String }) activeTab:
    | "about"
    | "terms"
    | "privacy"
    | "disclaimer" = "about";

  // The anchor to scroll to after opening
  @property({ type: String }) anchor?: string;

  firstUpdated() {
    this.dialog = this.shadowRoot?.querySelector("sl-dialog") as SlDialog;
  }

  open() {
    if (this.dialog) {
      this.dialog.show();

      // Set active tab based on property - FIXED: Use the proper way to activate a tab
      const tabGroup = this.shadowRoot?.querySelector("sl-tab-group");
      if (tabGroup) {
        console.log("SlDialog open, set active tab to: ", this.activeTab);

        // This is the key fix - using the show() method instead of setAttribute
        tabGroup.show(this.activeTab);
      }

      // If an anchor is provided, scroll to it after dialog is shown
      if (this.anchor) {
        console.log("SlDialog open, anchor:", this.anchor);
        // Need to wait for dialog to be fully rendered and tab to be active
        setTimeout(() => {
          const element = this.shadowRoot?.querySelector(`#${this.anchor}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 300); // Longer timeout to ensure tabs have activated
      }
    }
  }

  close() {
    if (this.dialog) {
      this.dialog.hide();
      this.anchor = undefined;

      // Dispatch a custom event that the app can listen for
      this.dispatchEvent(
        new CustomEvent("edoc-legal-modal-closed", {
          bubbles: true,
          composed: true,
        }),
      );
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
        }
      }, 100);
    }
  }

  render() {
    return html`
      <sl-dialog @sl-after-hide=${() => this.close()}>
        <!-- Add a custom close button that's positioned absolutely -->
        <sl-icon-button
          class="custom-close-button"
          name="x-lg"
          label=${msg("Close", { id: "legal.close_button" })}
          @click=${() => this.close()}
        ></sl-icon-button>

        <sl-tab-group @sl-tab-show=${this.handleTabChange}>
          <sl-tab slot="nav" panel="about" name="about">
            ${msg("About", { id: "legal.about_tab" })}
          </sl-tab>
          <sl-tab slot="nav" panel="terms" name="terms">
            ${msg("Terms", { id: "legal.terms_tab" })}
          </sl-tab>
          <sl-tab slot="nav" panel="privacy" name="privacy">
            ${msg("Privacy", { id: "legal.privacy_tab" })}
          </sl-tab>
          <sl-tab slot="nav" panel="disclaimer" name="disclaimer">
            ${msg("Disclaimers", { id: "legal.disclaimer_tab" })}
          </sl-tab>

          <sl-tab-panel name="about">
            <div class="legal-content">
              <h2>${msg("About eDoc Viewer", { id: "legal.about_title" })}</h2>

              <p>
                ${msg(
                  "eDoc Viewer is a simple tool for viewing and verifying electronic signature files. Here's what you need to know:",
                  { id: "legal.about_intro" },
                )}
              </p>

              <ul class="feature-list">
                <li>
                  <sl-icon name="lightning"></sl-icon>
                  <span
                    >${msg(
                      "Fast viewing of ASiC-E and eDoc content - easily see and access the documents inside your electronically signed containers without installing special software.",
                      { id: "legal.about_feature1" },
                    )}</span
                  >
                </li>
                <li>
                  <sl-icon name="shield-check"></sl-icon>
                  <span
                    >${msg(
                      "Signature verification is included, but please note that verification can be unreliable.",
                      { id: "legal.about_feature2" },
                    )}
                    ${msg(
                      html`For legally binding verification please use official
                        qualified validation services from
                        <a
                          href="https://eidas.ec.europa.eu/efda/trust-services/browse/eidas/tls/search/type?step=1"
                          target="_blank"
                          >EU Trusted service providers list</a
                        >
                        or
                        <a href="https://www.eparaksts.lv/" target="_blank"
                          >Latvian eParaksts validator</a
                        >. Think of eDoc Viewer as a convenient way to check
                        documents, not an official verification tool.`,
                      { id: "legal.about_feature2_verification_tools" },
                    )}</span
                  >
                </li>
                <li>
                  <sl-icon name="laptop"></sl-icon>
                  <span
                    >${msg(
                      "For optimal usage, open in Chrome on your desktop and install it as an app. This allows you to quickly view eDoc/ASiC-E files directly from your computer by simply clicking on them.",
                      { id: "legal.about_feature3" },
                    )}</span
                  >
                </li>
                <li>
                  <sl-icon name="phone"></sl-icon>
                  <span
                    >${msg(
                      "Mobile use is supported, but limited. On mobile devices, you'll need to manually open the app first, then click the browse button to select eDoc/ASiC-E files from your device.",
                      { id: "legal.about_feature4" },
                    )}</span
                  >
                </li>
                <li>
                  <sl-icon name="lock"></sl-icon>
                  <span
                    >${msg(
                      "All processing happens locally in your browser - your documents are never uploaded to any server, providing maximum privacy.",
                      { id: "legal.about_feature5" },
                    )}</span
                  >
                </li>
              </ul>

              <p>
                ${msg(
                  html`eDoc Viewer is an open-source project. Feel free to
                    contribute or report issues on our
                    <a
                      href="https://github.com/edgarsj/edocviewer"
                      target="_blank"
                      >GitHub repository</a
                    >.`,
                  { id: "legal.about_opensource" },
                )}
              </p>
            </div>
          </sl-tab-panel>

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
                ${msg("4. Intended Use", { id: "legal.terms_usage_title" })}
              </h3>
              <p>
                ${msg(
                  "eDoc Viewer is designed specifically for viewing and accessing documents inside electronically signed container files. That's all it does, and that's what it's meant for.",
                  { id: "legal.terms_usage_content" },
                )}
              </p>

              <span id="terms-modifications" class="anchor-link"></span>
              <h3>
                ${msg("5. Updates to the App", {
                  id: "legal.terms_modifications_title",
                })}
              </h3>
              <p>
                ${msg(
                  "We may update or change eDoc Viewer from time to time to improve it. While we'll try to make sure it keeps working well, we can't promise that it will always be available or function exactly the same way.",
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
                  "eDoc Viewer is provided \"as is\" and we can't guarantee it will always work perfectly. We've built it to be helpful, but sometimes things might not work as expected.",
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
                  "The eDoc Viewer team isn't responsible for any problems that might arise from using this app. We've created it to help you, but you use it at your own risk.",
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
                  html`While eDoc Viewer tries to verify electronic signatures,
                    for legally binding verification please use official
                    qualified validation services from
                    <a
                      href="https://eidas.ec.europa.eu/efda/trust-services/browse/eidas/tls/search/type?step=1"
                      target="_blank"
                      >EU Trusted service providers list</a
                    >
                    or
                    <a href="https://www.eparaksts.lv/" target="_blank"
                      >Latvian eParaksts validator</a
                    >. Think of eDoc Viewer as a convenient way to check
                    documents, not an official verification tool.`,
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
                  "While processing files locally in your browser helps protect your privacy, be aware that browser extensions or other software might potentially access your data. Please make sure your device and browser are up-to-date and secure when handling important documents.",
                  { id: "legal.disclaimer_security_content" },
                )}
              </p>

              <span id="disclaimer-opensource" class="anchor-link"></span>
              <h3>
                ${msg("5. Open Source Components", {
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
