import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LocaleAwareMixin } from "../mixins/LocaleAwareMixin";

// Import Shoelace components
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";

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

    .manual-install {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .manual-install-dialog {
      max-width: 480px;
    }

    .manual-install-content {
      display: grid;
      gap: 0.75rem;
      font-size: 0.95rem;
      color: var(--sl-color-neutral-700);
    }

    .manual-install-title {
      font-weight: 600;
      color: var(--sl-color-neutral-900);
    }

    .manual-install-steps {
      padding-left: 1rem;
      margin: 0;
    }

    .manual-install-image {
      width: 100%;
      max-width: 420px;
      border-radius: 12px;
      border: 1px solid var(--sl-color-neutral-200);
      background: var(--sl-color-neutral-0);
    }
  `;

  @state() private deferredPrompt: any = null;
  @state() private isInstalled = false;
  @state() private manualInstallHint: "ios" | "mac" | null = null;
  @state() private showManualInstallDialog = false;

  connectedCallback() {
    super.connectedCallback();

    // Check if already installed
    this.checkInstallationStatus();

    // Detect Safari manual install hint (iOS/macOS)
    this.manualInstallHint = this.detectManualInstallHint();

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

    if (this.isInstalled) {
      this.showManualInstallDialog = false;
    }

    console.log(
      `Installation status checked: App is ${this.isInstalled ? "installed" : "not installed"}`,
    );
  };

  private detectManualInstallHint() {
    const hasInstallPrompt = "onbeforeinstallprompt" in window;
    if (hasInstallPrompt) {
      return null;
    }

    const isIOS =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
      window.navigator.standalone === true ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1);

    // Safari doesn't expose install prompts, so we only show manual steps there.
    const isSafari = (() => {
      const ua = window.navigator.userAgent;
      const isAppleWebKit = /AppleWebKit/.test(ua);
      const isSafariEngine = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Brave/.test(ua);
      return isAppleWebKit && isSafariEngine;
    })();

    if (!isSafari) {
      return null;
    }

    return isIOS ? "ios" : "mac";
  }

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
    const shouldShowPromptButton =
      !this.isInstalled && this.deferredPrompt !== null;
    const shouldShowManualInstall =
      !this.isInstalled &&
      this.deferredPrompt === null &&
      this.manualInstallHint !== null;

    if (shouldShowPromptButton) {
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

    if (!shouldShowManualInstall) {
      return html``;
    }

    const isIOS = this.manualInstallHint === "ios";
    const buttonLabel = msg("Add to your local apps", {
      id: "app.install.localButton",
    });
    const dialogTitle = isIOS
      ? msg("Add to Home Screen", { id: "app.install.ios.title" })
      : msg("Add to Dock", { id: "app.install.mac.title" });
    const stepOne = msg("Open Safari’s Share menu.", {
      id: "app.install.step.share",
    });
    const stepTwo = isIOS
      ? msg("Select “Add to Home Screen”.", { id: "app.install.ios.step" })
      : msg("Select “Add to Dock” (it appears in Launchpad).", {
          id: "app.install.mac.step",
        });
    const note = msg(
      "Safari doesn’t show an install prompt, so these steps are manual.",
      { id: "app.install.safari.note" },
    );
    const imageAlt = isIOS
      ? msg("Safari Share menu with Add to Home Screen", {
          id: "app.install.ios.imageAlt",
        })
      : msg("Safari Share menu with Add to Dock", {
          id: "app.install.mac.imageAlt",
        });
    const imageSrc = isIOS
      ? "/images/safari-install-ios.svg"
      : "/images/safari-install-mac.svg";

    return html`
      <div class="manual-install">
        <sl-button
          size="small"
          @click=${() => (this.showManualInstallDialog = true)}
        >
          <sl-icon
            slot="prefix"
            name="download"
            style="font-size: 16px;"
          ></sl-icon>
          ${buttonLabel}
        </sl-button>
        <sl-dialog
          class="manual-install-dialog"
          ?open=${this.showManualInstallDialog}
          @sl-after-hide=${() => (this.showManualInstallDialog = false)}
        >
          <div class="manual-install-content">
            <div class="manual-install-title">${dialogTitle}</div>
            <div>${note}</div>
            <img class="manual-install-image" src=${imageSrc} alt=${imageAlt} />
            <ol class="manual-install-steps">
              <li>${stepOne}</li>
              <li>${stepTwo}</li>
            </ol>
          </div>
        </sl-dialog>
      </div>
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
