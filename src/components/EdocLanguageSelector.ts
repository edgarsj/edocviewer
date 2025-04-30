import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { getLocale } from "../localization/localization";
import { SupportedLocale, setAppLocale } from "../localization/localization";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";

/**
 * Component for language selection
 * @fires locale-changed - Fired when the language is changed
 */
@customElement("edoc-language-selector")
export class EdocLanguageSelector extends LitElement {
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
  `;

  /**
   * Current locale value
   */
  @property({ type: String })
  locale: SupportedLocale = "auto";

  @state()
  private effectiveLocale = getLocale();

  connectedCallback() {
    super.connectedCallback();

    // Listen for locale changes from other components
    window.addEventListener("localeChanged", this.handleLocaleEvent);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("localeChanged", this.handleLocaleEvent);
  }

  render() {
    return html`
      <span class="label">${msg("Language:", { id: "language.label" })}</span>
      <sl-select
        size="small"
        value=${this.locale}
        @sl-change=${this.handleLocaleChange}
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
    `;
  }

  private handleLocaleChange(e: CustomEvent) {
    const select = e.target as HTMLSelectElement;
    const newLocale = select.value as SupportedLocale;

    if (newLocale !== this.locale) {
      this.locale = newLocale;
      setAppLocale(newLocale);

      // Dispatch a custom event
      this.dispatchEvent(
        new CustomEvent("locale-changed", {
          detail: { locale: newLocale },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleLocaleEvent = (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail) {
      const { preference } = customEvent.detail;
      if (preference && preference !== this.locale) {
        this.locale = preference as SupportedLocale;
      }

      // Update effective locale for view updates
      this.effectiveLocale = getLocale();
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-language-selector": EdocLanguageSelector;
  }
}
