import { configureLocalization } from "@lit/localize";
import { sourceLocale, targetLocales } from "../generated/locale-codes";

// English strings - used directly and as fallback
export const en = {
  // App header
  "app.title": "eDoc Viewer",
  "app.description":
    "View and verify EU standard ASiC-E and Latvian eDoc files",

  // Language selector
  "language.label": "Language:",
  "language.auto": "Auto (Browser)",
  "language.en": "English",
  "language.lv": "Latvian",

  // Dropzone
  "dropzone.title": "Drop your eDoc file here",
  "dropzone.description": "or click to browse files",
  "dropzone.selectFile": "Select File",
  "dropzone.suggestedFileLabel": "Suggested file:",

  // Buttons
  "buttons.back": "Back",
  "buttons.downloadOriginal": "Download Original",
  "buttons.installApp": "Install App",

  // Status
  loading: "Loading...",

  // Error
  "error.title": "Error",
  "error.fileNotFound": "File not found",
  "error.invalidFile": "Invalid file format",
  "error.processingError": "Error processing file",
  "error.downloadError": "Error downloading file",

  // Signatures
  "signatures.title": "Signatures",
  "signatures.valid": "Valid",
  "signatures.invalid": "INVALID",
  "signatures.signedBy": "Signed by:",
  "signatures.signatureStatus": "Signature Status:",
  "signatures.referencedFiles": "Referenced files in signature",
  "signatures.unsignedFiles": "Unsigned files",
  "signatures.noSignatures": "No signatures found",

  // Documents
  "documents.title": "Document Files",
  "documents.noDocuments": "No document files found",

  // Metadata
  "metadata.title": "Metadata Files (Advanced)",
  "metadata.noMetadata": "No metadata files found",

  // File operations
  "file.view": "View",
  "file.download": "Download",

  // Offline status
  "offline.message": "You are currently offline. Some features may be limited.",
};

// Latvian strings
export const lv = {
  "app.title": "eDoc Skatītājs",
  "app.description":
    "Aplūko un pārbaudi ES standarta ASiC-E un Latvijas eDoc failus",

  "language.label": "Valoda:",
  "language.auto": "Automātiski (Pārlūks)",
  "language.en": "Angļu",
  "language.lv": "Latviešu",

  "dropzone.title": "Ievelc eDoc failu šeit",
  "dropzone.description": "vai noklikšķini, lai pārlūkotu failus",
  "dropzone.selectFile": "Izvēlēties Failu",
  "dropzone.suggestedFileLabel": "Ieteiktais fails:",

  "buttons.back": "Atpakaļ",
  "buttons.downloadOriginal": "Lejupielādēt Oriģinālu",
  "buttons.installApp": "Instalēt Lietotni",

  loading: "Ielāde...",

  "error.title": "Kļūda",
  "error.fileNotFound": "Fails nav atrasts",
  "error.invalidFile": "Nederīgs faila formāts",
  "error.processingError": "Kļūda apstrādājot failu",
  "error.downloadError": "Kļūda lejupielādējot failu",

  "signatures.title": "Paraksti",
  "signatures.valid": "Derīgs",
  "signatures.invalid": "NEDERĪGS",
  "signatures.signedBy": "Parakstījis:",
  "signatures.signatureStatus": "Paraksta Statuss:",
  "signatures.referencedFiles": "Parakstā iekļautie faili",
  "signatures.unsignedFiles": "Neparakstītie faili",
  "signatures.noSignatures": "Nav atrasti paraksti",

  "documents.title": "Dokumentu Faili",
  "documents.noDocuments": "Nav atrasti dokumentu faili",

  "metadata.title": "Metadatu Faili (Paplašināti)",
  "metadata.noMetadata": "Nav atrasti metadatu faili",

  "file.view": "Skatīt",
  "file.download": "Lejupielādēt",

  "offline.message":
    "Jūs pašlaik esat bezsaistē. Dažas funkcijas var būt ierobežotas.",
};

// Type definition for supported languages
export type SupportedLocale = "en" | "lv" | "auto";

// Create templates directly to avoid needing to load from files
const localeTemplates = {
  lv: { templates: lv },
};

// Configure localization with reliable fallback mechanism
export const { getLocale, setLocale, msg, str } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => {
    // Log the requested locale for debugging
    console.log(`Loading locale: ${locale}`);

    try {
      // First try to dynamically import from generated files
      // This approach will work if webpack correctly bundles the files
      if (locale === "lv") {
        try {
          // The actual import is kept for compatibility, but we'll fall back if needed
          const module = await import(`../generated/locales/${locale}`);
          console.log(`Successfully imported locale ${locale} from modules`);
          return module.default || module;
        } catch (importError) {
          console.log(
            `Could not import locale dynamically: ${importError.message}`,
          );
          // Import failed, use our hardcoded templates
          console.log(`Using hardcoded templates for ${locale}`);
          return localeTemplates[locale];
        }
      }

      // For English (source locale), return undefined to use the default strings
      return undefined;
    } catch (error) {
      // Log any errors for debugging
      console.error(`Error loading locale ${locale}:`, error);

      // Fall back to hardcoded translations
      if (locale !== sourceLocale && localeTemplates[locale]) {
        console.log(`Falling back to hardcoded translations for ${locale}`);
        return localeTemplates[locale];
      }

      // For source locale or missing translations, return undefined (will use default strings)
      return undefined;
    }
  },
});

// Detect browser language
export function detectBrowserLocale(): "en" | "lv" {
  const browserLang = navigator.language.toLowerCase();
  // Default to Latvian if the browser language starts with 'lv'
  if (browserLang.startsWith("lv")) {
    return "lv";
  }
  // Default to English for all other languages
  return "en";
}

// Load saved language preference from localStorage
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

// Set locale, handling 'auto' case
export async function setAppLocale(locale: SupportedLocale): Promise<void> {
  let effectiveLocale: "en" | "lv";

  if (locale === "auto") {
    effectiveLocale = detectBrowserLocale();
  } else {
    effectiveLocale = locale;
  }

  console.log(`Setting locale to: ${effectiveLocale} (preference: ${locale})`);

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
      console.log(`Successfully set locale to: ${effectiveLocale}`);
    } catch (error) {
      console.error(`Error setting locale to ${effectiveLocale}:`, error);

      // If all else fails, try manually setting UI texts using the hardcoded translations
      fallbackManualLocalization(effectiveLocale);
    }
  }

  // Dispatch custom event for components to update
  window.dispatchEvent(
    new CustomEvent("localeChanged", {
      detail: { locale: effectiveLocale, preference: locale },
    }),
  );
}

// Extra fallback for extreme cases - directly sets text content via data-i18n attributes
function fallbackManualLocalization(locale: "en" | "lv") {
  console.log("Using fallback manual localization");
  const translations = locale === "lv" ? lv : en;

  // Update elements with data-i18n attributes
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (key && translations[key]) {
      element.textContent = translations[key];
    }
  });

  // Update elements with data-i18n-attr attributes (for attributes like title, placeholder)
  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const attrMap = element.getAttribute("data-i18n-attr");
    if (attrMap) {
      try {
        // Format: "attr1:key1;attr2:key2"
        const pairs = attrMap.split(";");
        pairs.forEach((pair) => {
          const [attr, key] = pair.split(":");
          if (attr && key && translations[key]) {
            element.setAttribute(attr, translations[key]);
          }
        });
      } catch (e) {
        console.warn("Error processing data-i18n-attr", e);
      }
    }
  });
}
