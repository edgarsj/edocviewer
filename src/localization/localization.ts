import { configureLocalization } from "@lit/localize";
import { sourceLocale, targetLocales } from "../generated/locale-codes";

// Type definition for supported languages
export type SupportedLocale = "en" | "lv" | "auto";

// Simplified configuration without predefined messages
export const { getLocale, setLocale, msg, str } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => {
    // Only load non-English locales
    if (locale !== "en") {
      try {
        const module = await import(`../generated/locales/${locale}`);
        return module.default || module;
      } catch (error) {
        console.error(`Error loading locale ${locale}:`, error);
        // Just fall back to English if there's any error
        return undefined;
      }
    }
    // For English, return undefined to use the default strings
    return undefined;
  },
});

// Detect browser language
export function detectBrowserLocale(): "en" | "lv" {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("lv")) {
    return "lv";
  }
  return "en";
}

// Load saved language preference
export function loadSavedLocale(): SupportedLocale {
  try {
    const savedLang = localStorage.getItem(
      "edoc-viewer-lang",
    ) as SupportedLocale | null;
    if (
      savedLang &&
      (savedLang === "en" || savedLang === "lv" || savedLang === "auto")
    ) {
      return savedLang;
    }
  } catch (e) {
    console.warn("Could not load language preference from localStorage", e);
  }
  return "auto";
}

// Set locale function
export async function setAppLocale(locale: SupportedLocale): Promise<void> {
  let effectiveLocale: "en" | "lv";

  if (locale === "auto") {
    effectiveLocale = detectBrowserLocale();
  } else {
    effectiveLocale = locale;
  }

  // Update document language for accessibility
  document.documentElement.lang = effectiveLocale;

  // Save user preference in localStorage
  try {
    localStorage.setItem("edoc-viewer-lang", locale);
  } catch (e) {
    console.warn("Could not save language preference to localStorage", e);
  }

  // Only change if locale is different from current
  if (effectiveLocale !== getLocale()) {
    try {
      await setLocale(effectiveLocale);
    } catch (error) {
      console.error(`Error setting locale to ${effectiveLocale}:`, error);
      // If setting locale fails, we'll just stay with the current locale
    }
  }

  // Dispatch custom event for components to update
  const event = new CustomEvent("localeChanged", {
    detail: { locale: effectiveLocale, preference: locale },
    bubbles: true,
    composed: true,
  });

  window.dispatchEvent(event);
  document.dispatchEvent(event);
}
