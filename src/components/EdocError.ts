import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";

/**
 * Component for displaying error messages
 */
@customElement("edoc-error")
export class EdocError extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    .hidden {
      display: none;
    }
  `;

  /**
   * Error message to display
   */
  @property({ type: String })
  message = "";

  /**
   * Controls whether the error is visible
   */
  @property({ type: Boolean })
  visible = false;

  render() {
    if (!this.visible || !this.message) {
      return html``;
    }

    return html`
      <sl-alert variant="danger" open>
        <strong>${msg("Error", { id: "error.title" })}</strong><br />
        ${this.message}
      </sl-alert>
    `;
  }

  /**
   * Show error with a message
   * @param message Error message to display
   */
  public showError(message: string) {
    this.message = message;
    this.visible = true;
  }

  /**
   * Hide the error display
   */
  public hideError() {
    this.visible = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-error": EdocError;
  }
}
