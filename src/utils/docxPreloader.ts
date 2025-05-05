// src/utils/docxPreloader.ts

/**
 * This file exists to ensure webpack includes docx-preview in the build
 * but loads it only when needed through code-splitting
 */

// Define a function that will load docx-preview when called
export function preloadDocxPreview(): Promise<any> {
  console.log("Preloading docx-preview support");
  return import(/* webpackChunkName: "docx-preview-bundle" */ "docx-preview");
}

// Export a flag to indicate docx support is available
export const DOCX_PREVIEW_SUPPORTED = true;
