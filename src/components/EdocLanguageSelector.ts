import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getLocale } from "../localization/localization";
import { SupportedLocale } from "../localization/localization";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import {
  registerSelector,
  unregisterSelector,
  changeLocale,
} from "../utils/locale-integration";

// Import Shoelace components
import "@shoelace-style/shoelace/dist/components/button/button.js";

/**
 * Component for language selection - simplified toggle button
 * @fires locale-changed - Fired when the language is changed
 */
@customElement("edoc-language-selector")
export class EdocLanguageSelector extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .language-button {
      min-width: 80px;
    }
  `;

  /**
   * Current locale value
   */
  @property({ type: String })
  locale: SupportedLocale = "en";

  /**
   * Internal flag for initialization
   */
  private isInitialized = false;

  /**
   * Flag to track if locale was updated externally
   */
  private localeUpdatedExternally = false;

  /**
   * Lifecycle method when the component is connected to the DOM
   */
  connectedCallback() {
    super.connectedCallback();

    // Initialize the locale property to the current value
    const currentLocale = getLocale();
    console.log("EdocLanguageSelector: Initialized with locale", currentLocale);
    this.locale = currentLocale as SupportedLocale;

    // Register with the integration helper
    registerSelector(this);
  }

  /**
   * Lifecycle method when the component is disconnected from the DOM
   */
  disconnectedCallback() {
    // Unregister from the integration helper
    unregisterSelector(this);

    super.disconnectedCallback();
  }

  /**
   * Lifecycle method after component update
   */
  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    // console.log("EdocLanguageSelector: Updated");
    // console.log(JSON.stringify(changedProperties));
    // If this is the first update, mark as initialized
    if (!this.isInitialized) {
      this.isInitialized = true;
    }

    // If the locale property changed and it wasn't from an external update
    if (changedProperties.has("locale") && !this.localeUpdatedExternally) {
      this.handleLocaleChangeInternal();
    }

    // Reset the external update flag
    this.localeUpdatedExternally = false;
  }

  /**
   * Handle when the locale is updated from an external source
   * @param newLocale The new locale value
   */
  public updateLocaleValue(newLocale: SupportedLocale) {
    // console.log(
    //   "EdocLanguageSelector: External update locale value",
    //   newLocale,
    // );
    if (newLocale !== this.locale) {
      // Set flag to prevent feedback loop
      this.localeUpdatedExternally = true;

      // Update the property
      this.locale = newLocale;

      // Add highlight effect
      this.addHighlightEffect();
    }
  }

  render() {
    const currentLocale = getLocale();
    const buttonText = currentLocale === "en" ? "Latviski" : "English";
    const targetLocale = currentLocale === "en" ? "lv" : "en";

    return html`
      <div class="language-selector-container">
        <sl-button
          size="small"
          @click=${() => this.toggleLanguage(targetLocale)}
          class="language-button"
        >
          <sl-icon
            slot="prefix"
            name="translate"
            style="font-size: 16px;"
          ></sl-icon
          >${buttonText}
        </sl-button>
      </div>
    `;
  }

  /**
   * Toggle between languages
   */
  private toggleLanguage(targetLocale: SupportedLocale) {
    console.log(
      "EdocLanguageSelector: Toggling language from",
      this.locale,
      "to",
      targetLocale,
    );
    // Set the new locale and trigger the update
    this.locale = targetLocale;
  }

  /**
   * Handle internal locale change (when this.locale changes)
   */
  private async handleLocaleChangeInternal() {
    // console.log(
    //   "EdocLanguageSelector: Internal update locale value",
    //   this.locale,
    // );
    try {
      // Use the integration helper to change the locale
      await changeLocale(this.locale);

      // Add highlight effect to show the change
      this.addHighlightEffect();
    } catch (error) {
      console.error("Error changing locale", error);
    }
  }

  /**
   * Add a highlight effect to show the locale change
   */
  private addHighlightEffect() {
    const container = this.shadowRoot?.querySelector(
      ".language-selector-container",
    );
    if (container) {
      // Remove any existing highlight class
      container.classList.remove("highlight");

      // Force a reflow to restart the animation
      void container.offsetWidth;

      // Add the highlight class
      container.classList.add("highlight");
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-language-selector": EdocLanguageSelector;
  }
}
