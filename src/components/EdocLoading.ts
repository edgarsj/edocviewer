import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";

/**
 * Component for displaying a loading indicator
 */
@customElement("edoc-loading")
export class EdocLoading extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      padding: 2rem 0;
      text-align: center;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    sl-spinner {
      font-size: 2rem;
      --indicator-color: var(--sl-color-primary-600);
    }

    .loading-text {
      margin-top: 0.75rem;
      color: var(--sl-color-gray-600);
    }

    .hidden {
      display: none;
    }
  `;

  /**
   * Custom loading message
   */
  @property({ type: String })
  message = "";

  /**
   * Controls whether the loader is visible
   */
  @property({ type: Boolean })
  visible = false;

  render() {
    if (!this.visible) {
      return html``;
    }

    return html`
      <div class="spinner-container">
        <sl-spinner></sl-spinner>
        <p class="loading-text">
          ${this.message || msg("Loading...", { id: "loading" })}
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-loading": EdocLoading;
  }
}
