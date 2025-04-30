// src/mixins/LocaleAwareMixin.ts

import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import { getLocale } from "../localization/localization";

/**
 * Mixin that makes a LitElement re-render when the locale changes
 *
 * @param superClass The class to extend
 * @returns A class that extends the provided class with locale awareness
 */
export const LocaleAwareMixin = <T extends new (...args: any[]) => LitElement>(
  superClass: T,
) => {
  class LocaleAwareElement extends superClass {
    /**
     * Current effective locale (tracked to trigger re-renders)
     */
    @property({ type: String })
    private effectiveLocale = getLocale();

    connectedCallback() {
      super.connectedCallback();

      // Listen for locale changes
      window.addEventListener("localeChanged", this.handleLocaleChange);
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      // Clean up event listener
      window.removeEventListener("localeChanged", this.handleLocaleChange);
    }

    /**
     * Handle locale change events
     */
    private handleLocaleChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        // Update the effective locale, which will trigger a re-render
        this.effectiveLocale = getLocale();
      }
    };
  }

  return LocaleAwareElement as T & {
    new (...args: any[]): LocaleAwareElement;
  };
};
