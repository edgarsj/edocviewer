/**
 * Helper functions for navigating to the legal modal
 */

/**
 * Open the legal modal with a specific section and anchor
 * @param section The tab section to open
 * @param anchor Optional anchor within the section
 */
export function openLegalModal(
  section: "about" | "terms" | "privacy" | "disclaimer",
  anchor?: string,
) {
  // Find the EdocApp component
  const appElement = document.querySelector("edoc-app") as any;

  if (appElement && appElement.openLegalModalWithSection) {
    // Call the refactored method with needsPrefix=true since we're
    // passing raw anchor names from components
    appElement.openLegalModalWithSection(section, anchor, true);
    return true;
  }

  // Fallback to direct URL navigation if app component not found
  if (anchor) {
    window.location.hash = `${section}-${anchor}`;
  } else {
    window.location.hash = section;
  }

  return false;
}
