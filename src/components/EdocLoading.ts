import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";

/**
 * Component for displaying loading state
 */
@customElement("edoc-loading")
export class EdocLoading extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      margin: 2rem 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .spinner-container {
      margin-bottom: 1rem;
    }

    sl-spinner {
      font-size: 2rem;
    }

    .loading-message {
      margin-bottom: 1rem;
      font-weight: 500;
      color: var(--sl-color-primary-700);
    }

    .hidden {
      display: none;
    }
  `;

  /**
   * Controls whether the loading indicator is visible
   */
  @property({ type: Boolean })
  visible = false;

  render() {
    if (!this.visible) {
      return html``;
    }

    return html`
      <div class="loading-container">
        <div class="spinner-container">
          <sl-spinner></sl-spinner>
        </div>

        <div class="loading-message">${msg("Processing document...")}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-loading": EdocLoading;
  }
}
