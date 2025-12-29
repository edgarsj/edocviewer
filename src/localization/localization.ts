import { configureLocalization } from "@lit/localize";
import { sourceLocale, targetLocales } from "../generated/locale-codes";

// Type definition for supported languages
export type SupportedLocale = "en" | "lv";

let isInitializing = false;

// Simplified configuration without predefined messages
export const { getLocale, setLocale, msg, str } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => {
    // Only load non-English locales
    if (locale !== "en") {
      try {
        const module = await import(`../generated/locales/${locale}.ts`);
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

export function detectBrowserLocale(): "en" | "lv" {
  console.log("Detecting browser locale...");
  try {
    // Check primary language first
    if (navigator.language.toLowerCase().startsWith("lv")) {
      return "lv";
    }
    // Check navigator.languages array first
    if (navigator.languages && navigator.languages.length) {
      for (const lang of navigator.languages) {
        if (lang.toLowerCase().startsWith("lv")) {
          return "lv";
        } else if (lang.toLowerCase().startsWith("en")) {
          return "en";
        }
      }
    }

    // Default to English
    return "en";
  } catch (e) {
    console.warn("Error detecting browser locale:", e);
    return "en";
  }
}

// Load saved language / detect
export function loadSavedLocale(): "en" | "lv" {
  try {
    // Try to get the saved language from localStorage
    const savedLang = localStorage.getItem("edoc-viewer-lang");

    // If we have a valid saved language, use it directly
    if (savedLang === "en" || savedLang === "lv") {
      return savedLang;
    }

    // If null or invalid value, detect from browser and save it
    const detectedLocale = detectBrowserLocale();
    localStorage.setItem("edoc-viewer-lang", detectedLocale);
    console.log("Detected locale:", detectedLocale);
    console.log("Saved locale:", detectedLocale);
    return detectedLocale;
  } catch (e) {
    // If any localStorage error occurs, just return the detected locale
    console.warn("Could not access localStorage:", e);
    return detectBrowserLocale();
  }
}

// Set locale function
export async function setAppLocale(locale: SupportedLocale): Promise<void> {
  // Track and log calls during initialization
  console.log("App locale requested:", locale);

  // Skip redundant calls during initialization phase
  if (isInitializing) {
    console.log(`Skipping redundant locale change during initialization`);
    return;
  }

  // Set flag to prevent reentrant calls
  const wasInitializing = isInitializing;
  if (!wasInitializing) isInitializing = true;

  try {
    let effectiveLocale: "en" | "lv";
    if (locale === "lv") {
      effectiveLocale = "lv";
    } else {
      effectiveLocale = "en";
    }

    // Rest of your function...

    // Update document language
    document.documentElement.lang = effectiveLocale;

    // Save to localStorage
    try {
      localStorage.setItem("edoc-viewer-lang", effectiveLocale);
    } catch (e) {
      console.warn("Could not save language preference");
    }

    // Update lit-localize
    if (effectiveLocale !== getLocale()) {
      await setLocale(effectiveLocale);
    }

    // Dispatch events
    const event = new CustomEvent("localeChanged", {
      detail: { locale: effectiveLocale },
      bubbles: true,
      composed: true,
    });

    window.dispatchEvent(event);
    document.dispatchEvent(event);
  } finally {
    // Reset flag when done
    if (!wasInitializing) isInitializing = false;
  }
}
