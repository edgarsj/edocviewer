import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";

// Import Shoelace components
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

/**
 * Component for PWA installation button
 */
@customElement("edoc-install-button")
export class EdocInstallButton extends LocaleAwareMixin(LitElement) {
  static styles = css`
    :host {
      display: inline-block;
      margin-right: 0.5rem;
    }

    .hidden {
      display: none !important;
    }
  `;

  @state() private deferredPrompt: any = null;
  @state() private isInstalled = false;

  connectedCallback() {
    super.connectedCallback();

    // Check if already installed
    this.checkInstallationStatus();

    // Listen for display mode changes
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", this.checkInstallationStatus);
    window
      .matchMedia("(display-mode: fullscreen)")
      .addEventListener("change", this.checkInstallationStatus);
    window
      .matchMedia("(display-mode: minimal-ui)")
      .addEventListener("change", this.checkInstallationStatus);
    window
      .matchMedia("(display-mode: window-controls-overlay)")
      .addEventListener("change", this.checkInstallationStatus);

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", this.captureInstallPrompt);

    // Also listen for app installed event
    window.addEventListener("appinstalled", this.handleAppInstalled);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up event listeners
    window
      .matchMedia("(display-mode: standalone)")
      .removeEventListener("change", this.checkInstallationStatus);
    window
      .matchMedia("(display-mode: fullscreen)")
      .removeEventListener("change", this.checkInstallationStatus);
    window
      .matchMedia("(display-mode: minimal-ui)")
      .removeEventListener("change", this.checkInstallationStatus);
    window
      .matchMedia("(display-mode: window-controls-overlay)")
      .removeEventListener("change", this.checkInstallationStatus);
    window.removeEventListener(
      "beforeinstallprompt",
      this.captureInstallPrompt,
    );
    window.removeEventListener("appinstalled", this.handleAppInstalled);
  }

  private checkInstallationStatus = () => {
    // Check all the ways we might be in an installed mode
    this.isInstalled =
      // Standalone mode (most common for PWAs)
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS standalone mode
      (window.navigator as any).standalone === true ||
      // Android TWA (Trusted Web Activity) mode
      document.referrer.includes("android-app://") ||
      // Other display modes that indicate installation
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches;

    console.log(
      `Installation status checked: App is ${this.isInstalled ? "installed" : "not installed"}`,
    );
  };

  private captureInstallPrompt = (e: Event) => {
    // Store the event for later use without preventing default
    this.deferredPrompt = e;
    console.log("Install prompt captured, button will be enabled");
  };

  private handleAppInstalled = () => {
    console.log("App was just installed");
    this.isInstalled = true;
    this.deferredPrompt = null;
  };

  render() {
    // Only show the button if not installed AND we have a prompt available
    const shouldShowButton = !this.isInstalled && this.deferredPrompt !== null;

    if (!shouldShowButton) {
      return html``;
    }

    return html`
      <sl-button size="small" @click=${this.installApp}>
        <sl-icon
          slot="prefix"
          name="download"
          style="font-size: 16px;"
        ></sl-icon>
        ${msg("Install to device", { id: "app.installButton" })}
      </sl-button>
    `;
  }

  private async installApp() {
    if (!this.deferredPrompt) {
      console.log("No installation prompt available");
      return;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        this.isInstalled = true;
      } else {
        console.log("User dismissed the install prompt");
      }

      // We've used the prompt, and can't use it again, discard it
      this.deferredPrompt = null;
    } catch (error) {
      console.error("Error during app installation:", error);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edoc-install-button": EdocInstallButton;
  }
}
