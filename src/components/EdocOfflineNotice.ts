import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

/**
 * Component for displaying offline notification
 */
@customElement("edoc-offline-notice")
export class EdocOfflineNotice extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 1000;
      max-width: 300px;
    }

    .hidden {
      display: none;
    }

    sl-alert::part(base) {
      border: 1px solid var(--sl-color-warning-300);
    }
  `;

  @state()
  private isOffline = false;

  @state()
  private isDismissed = false;

  connectedCallback() {
    super.connectedCallback();

    // Check initial online status
    this.isOffline = !navigator.onLine;

    // Add event listeners for online/offline events
    window.addEventListener("online", this.handleNetworkChange);
    window.addEventListener("offline", this.handleNetworkChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Remove event listeners
    window.removeEventListener("online", this.handleNetworkChange);
    window.removeEventListener("offline", this.handleNetworkChange);
  }

  render() {
    // Don't show if online or already dismissed
    if (!this.isOffline || this.isDismissed) {
      return html``;
    }

    return html`
      <sl-alert
        variant="warning"
        duration="0"
        closable
        @sl-after-hide=${this.handleDismiss}
      >
        <sl-icon slot="icon" name="wifi-off"></sl-icon>
        ${msg("You are currently offline. Some features may be limited.", {
          id: "offline.message",
        })}
      </sl-alert>
    `;
  }

  private handleNetworkChange = () => {
    this.isOffline = !navigator.onLine;

    // Reset dismissed state when going offline
    if (this.isOffline) {
      this.isDismissed = false;
    }
  };

  private handleDismiss() {
    this.isDismissed = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-offline-notice": EdocOfflineNotice;
  }
}
