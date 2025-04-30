// src/utils/locale-integration.ts
// This file helps ensure proper integration between different components that handle localization

import {
  SupportedLocale,
  setAppLocale,
  getLocale,
} from "../localization/localization";

/**
 * Class that helps integrate localization across different components
 */
export class LocaleIntegrationHelper {
  private static instance: LocaleIntegrationHelper;

  // Flag to track initialization
  private initialized = false;

  // Keep track of language selector components
  private selectors: Set<HTMLElement> = new Set();

  /**
   * Get singleton instance
   */
  public static getInstance(): LocaleIntegrationHelper {
    if (!LocaleIntegrationHelper.instance) {
      LocaleIntegrationHelper.instance = new LocaleIntegrationHelper();
    }
    return LocaleIntegrationHelper.instance;
  }

  /**
   * Private constructor
   */
  private constructor() {}

  /**
   * Initialize the helper
   */
  public initialize(): void {
    if (this.initialized) return;

    // Set up event listeners
    this.setupEventListeners();

    // Expose functions for debugging
    this.exposeDebugFunctions();

    this.initialized = true;
  }

  /**
   * Register a language selector component
   * @param selector Language selector component
   */
  public registerSelector(selector: HTMLElement): void {
    this.selectors.add(selector);
  }

  /**
   * Unregister a language selector component
   * @param selector Language selector component
   */
  public unregisterSelector(selector: HTMLElement): void {
    this.selectors.delete(selector);
  }

  /**
   * Handle a locale change request
   * @param locale The new locale
   */
  public async handleLocaleChange(locale: SupportedLocale): Promise<void> {
    try {
      // Apply the locale
      await setAppLocale(locale);

      // Update all selectors
      this.updateSelectors(locale);
    } catch (error) {
      console.error("LocaleIntegration: Error changing locale", error);
    }
  }

  /**
   * Update all registered selectors
   * @param locale The new locale
   */
  private updateSelectors(locale: SupportedLocale): void {
    // For each registered selector, set the locale property
    this.selectors.forEach((selector) => {
      // The selector should have a locale property
      if ("locale" in selector) {
        (selector as any).locale = locale;
      }
    });
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for custom locale-change events from any component
    document.addEventListener("locale-change", (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.locale) {
        const locale = customEvent.detail.locale as SupportedLocale;
        console.log(`EVENT: Locale change! to ${locale}`);
        console.log(`EVENT: detail:${JSON.stringify(customEvent.detail)}`);
        this.handleLocaleChange(locale);
      }
    });

    // Also listen for kebab-case version for backward compatibility
    document.addEventListener("locale-changed", (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.locale) {
        const locale = customEvent.detail.locale as SupportedLocale;
        console.log(`EVENT: Locale changed! to ${locale}`);
        console.log(`EVENT: detail:${JSON.stringify(customEvent.detail)}`);
        this.handleLocaleChange(locale);
      }
    });
  }

  /**
   * Expose debug functions to the global window object
   */
  private exposeDebugFunctions(): void {
    // Create namespace on window if it doesn't exist
    (window as any).edocApp = (window as any).edocApp || {};

    // Expose functions
    (window as any).edocApp.getLocale = getLocale;
    (window as any).edocApp.setAppLocale = (locale: SupportedLocale) => {
      return this.handleLocaleChange(locale);
    };
  }
}

/**
 * Initialize the locale integration helper
 */
export function initializeLocaleIntegration(): void {
  const helper = LocaleIntegrationHelper.getInstance();
  helper.initialize();
}

/**
 * Register a selector component with the integration helper
 * @param selector The language selector component
 */
export function registerSelector(selector: HTMLElement): void {
  const helper = LocaleIntegrationHelper.getInstance();
  helper.registerSelector(selector);
}

/**
 * Unregister a selector component from the integration helper
 * @param selector The language selector component
 */
export function unregisterSelector(selector: HTMLElement): void {
  const helper = LocaleIntegrationHelper.getInstance();
  helper.unregisterSelector(selector);
}

/**
 * Change the locale through the integration helper
 * @param locale The new locale
 */
export function changeLocale(locale: SupportedLocale): Promise<void> {
  const helper = LocaleIntegrationHelper.getInstance();
  return helper.handleLocaleChange(locale);
}
