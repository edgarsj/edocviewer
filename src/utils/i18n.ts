import enTranslations from "../i18n/en";
import lvTranslations from "../i18n/lv";

export type SupportedLanguage = "en" | "lv" | "auto";

const translations = {
  en: enTranslations,
  lv: lvTranslations,
};

export class I18nManager {
  private currentLanguage: SupportedLanguage = "auto";
  private effectiveLanguage: "en" | "lv" = "en"; // Default fallback
  private subscribers: Array<() => void> = [];

  constructor() {
    this.detectBrowserLanguage();
  }

  /**
   * Detect browser language and set as default if in auto mode
   */
  private detectBrowserLanguage(): void {
    const browserLang = navigator.language.toLowerCase();

    // Default to Latvian if the browser language starts with 'lv'
    if (browserLang.startsWith("lv")) {
      this.effectiveLanguage = "lv";
    } else {
      this.effectiveLanguage = "en"; // Default to English for all other languages
    }
  }

  /**
   * Get translation for a specific key
   * @param key Dot-notation path to the translation
   * @param params Parameters to interpolate
   * @returns Translated string
   */
  translate(key: string, params: Record<string, string> = {}): string {
    const keys = key.split(".");
    let value: any = translations[this.effectiveLanguage];

    // Navigate through the nested keys
    for (const k of keys) {
      if (value === undefined || value === null) return key;
      value = value[k];
    }

    // If value is not found, return the key as fallback
    if (value === undefined || value === null) return key;

    // Interpolate parameters if any
    let result = String(value);
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`{{${paramKey}}}`, "g"), paramValue);
    });

    return result;
  }

  /**
   * Set the current language
   * @param lang Language to set
   */
  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;

    if (lang === "auto") {
      this.detectBrowserLanguage();
    } else {
      this.effectiveLanguage = lang;
    }

    // Notify all subscribers about the language change
    this.notifySubscribers();

    // Store preference in localStorage
    try {
      localStorage.setItem("edoc-viewer-lang", lang);
    } catch (e) {
      console.warn("Could not save language preference to localStorage", e);
    }
  }

  /**
   * Get the current language
   * @returns Current language code
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Get the effective language (resolved from auto if needed)
   * @returns Effective language code
   */
  getEffectiveLanguage(): "en" | "lv" {
    return this.effectiveLanguage;
  }

  /**
   * Load saved language preference from localStorage
   */
  loadSavedLanguage(): void {
    try {
      const savedLang = localStorage.getItem(
        "edoc-viewer-lang",
      ) as SupportedLanguage | null;
      if (
        savedLang &&
        (savedLang === "en" || savedLang === "lv" || savedLang === "auto")
      ) {
        this.setLanguage(savedLang);
      }
    } catch (e) {
      console.warn("Could not load language preference from localStorage", e);
    }
  }

  /**
   * Subscribe to language changes
   * @param callback Function to call when language changes
   * @returns Unsubscribe function
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all subscribers about language changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback());
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  applyTranslations(): void {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (key) {
        element.textContent = this.translate(key);
      }
    });
  }
}

// Create and export a singleton instance
const i18n = new I18nManager();
export default i18n;
