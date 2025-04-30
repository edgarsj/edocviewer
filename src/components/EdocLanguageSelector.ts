import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { getLocale } from "../localization/localization";
import { SupportedLocale } from "../localization/localization";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import {
  registerSelector,
  unregisterSelector,
  changeLocale,
} from "../utils/locale-integration";

// Import Shoelace components
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";

/**
 * Component for language selection
 * @fires locale-changed - Fired when the language is changed
 */
@customElement("edoc-language-selector")
export class EdocLanguageSelector extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .label {
      margin-right: 0.5rem;
      font-size: 0.875rem;
      color: var(--sl-color-gray-700);
    }

    sl-select::part(form-control) {
      margin-bottom: 0;
    }

    /* For debugging - add a border when locale changes occur */
    @keyframes highlight {
      0% {
        outline: 2px solid transparent;
      }
      50% {
        outline: 2px solid var(--sl-color-primary-500);
      }
      100% {
        outline: 2px solid transparent;
      }
    }

    .highlight {
      animation: highlight 1s ease-in-out;
    }
  `;

  /**
   * Current locale value
   */
  @property({ type: String })
  locale: SupportedLocale = "auto";

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
    this.locale =
      currentLocale === "en" || currentLocale === "lv" ? currentLocale : "auto";

    // Register with the integration helper
    registerSelector(this);

    console.log(`EdocLanguageSelector: Connected with locale ${this.locale}`);
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

    // If this is the first update, mark as initialized
    if (!this.isInitialized) {
      this.isInitialized = true;
      console.log("EdocLanguageSelector: Component initialized");
    }

    // If the locale property changed and it wasn't from an external update
    if (changedProperties.has("locale") && !this.localeUpdatedExternally) {
      console.log(
        `EdocLanguageSelector: Locale changed internally to ${this.locale}`,
      );
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
    console.log(`EdocLanguageSelector: External locale update to ${newLocale}`);

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
    return html`
      <div class="language-selector-container">
        <span class="label">${msg("Language:", { id: "language.label" })}</span>
        <sl-select
          size="small"
          value=${this.locale}
          @sl-change=${this.handleLocaleSelectChange}
        >
          <sl-option value="auto"
            >${msg("Auto (Browser)", { id: "language.auto" })}</sl-option
          >
          <sl-option value="en"
            >${msg("English", { id: "language.en" })}</sl-option
          >
          <sl-option value="lv"
            >${msg("Latvian", { id: "language.lv" })}</sl-option
          >
        </sl-select>
      </div>
    `;
  }

  /**
   * Handle select dropdown change
   */
  private handleLocaleSelectChange(e: Event) {
    console.log("EdocLanguageSelector: Select dropdown change detected");

    // Get the new locale from the select element
    const select = e.target as any;
    if (!select || !select.value) {
      console.error("EdocLanguageSelector: Invalid select event", e);
      return;
    }

    const newLocale = select.value as SupportedLocale;
    console.log(`EdocLanguageSelector: Dropdown value changed to ${newLocale}`);

    if (newLocale !== this.locale) {
      // Update the property, which will trigger updated() lifecycle method
      this.locale = newLocale;
    }
  }

  /**
   * Handle internal locale change (when this.locale changes)
   */
  private async handleLocaleChangeInternal() {
    console.log(
      `EdocLanguageSelector: Processing internal locale change to ${this.locale}`,
    );

    try {
      // Use the integration helper to change the locale
      await changeLocale(this.locale);

      // Add highlight effect to show the change
      this.addHighlightEffect();

      console.log(
        `EdocLanguageSelector: Locale change to ${this.locale} complete`,
      );
    } catch (error) {
      console.error("EdocLanguageSelector: Error changing locale", error);
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
