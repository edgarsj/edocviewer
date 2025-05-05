// src/utils/docxAdapter.ts

// This adapter module handles the dynamic import of docx-preview
// and provides a wrapper for rendering DOCX files

// Add a static import at the top to ensure webpack detects this dependency
// but don't use it directly - we'll still use dynamic import later
import "docx-preview";

/**
 * Loads docx-preview and renders a DOCX file
 * @param fileData The DOCX file data as Uint8Array
 * @param container The HTML element to render into
 * @returns A promise that resolves when rendering is complete
 */
export async function renderDocx(
  fileData: Uint8Array,
  container: HTMLElement,
): Promise<void> {
  try {
    // Dynamically import docx-preview (will be in a separate bundle)
    const docxPreview = await import("docx-preview");

    // Create a blob from the file data
    const blob = new Blob([fileData], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Render DOCX in the container
    await docxPreview.renderAsync(blob, container, undefined, {
      className: "docx-preview",
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: true,
      experimental: false,
      trimXmlDeclaration: true,
      useBase64URL: false,
    });

    return;
  } catch (error) {
    console.error("Error rendering DOCX:", error);
    // Show error message in container
    container.innerHTML = `
      <div class="error-message" style="padding: 2rem; color: red; text-align: center;">
        Error rendering DOCX file. The file may be corrupted or not supported.
      </div>
    `;
    throw error;
  }
}
