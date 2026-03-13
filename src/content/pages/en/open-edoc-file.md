---
title: "How to Open an eDoc File Online | eDoc Reader Guide"
description: "Learn how to open .edoc, .asice, and .sce files online, inspect attachments, and verify signatures in your browser."
locale: "en"
pageType: "open-edoc-file"
defaultViewerLocale: "en"
alternates:
  en: "/open-edoc-file"
  lv: "/lv/atvert-edoc-failu"
---

# How to Open an eDoc File Online

An **eDoc file** is an ASiC-E-based container for digitally signed documents. If you received an `.edoc`, `.asice`, or `.sce` file, you can open it in your browser and inspect the signed contents without installing desktop software.

## Quick Start

The easiest way to open an eDoc file is using our online viewer below:

1. **Drag and drop** your `.edoc`, `.asice`, or `.sce` file onto the viewer
2. The file will be **automatically extracted** and displayed
3. **Verify signatures** and view all contained documents
4. **Download** individual files if needed

## Alternative Viewers

While there are several options for opening eDoc files, here's how they compare:

### eDoc Viewer (This Site)
- ✅ Works in any modern browser
- ✅ No installation required
- ✅ Document contents stay local to your browser
- ✅ Works offline as PWA
- ✅ Free and open-source

### Desktop Applications
- ⚠️ Requires installation and updates
- ⚠️ Platform-specific (Windows/macOS/Linux)
- ✅ May offer additional features
- ⚠️ Often paid software

### Government Portals
- ⚠️ Limited to specific file types
- ⚠️ Requires internet connection
- ⚠️ May have file size limits
- ✅ Official verification services

For a detailed comparison, see our [Compare Viewers](/compare-viewers) page.

## Technical Details

eDoc files use the **ASiC-E** (Associated Signature Container Extended) format, which is a ZIP archive containing:

- Original documents (PDF, DOCX, images, etc.)
- XML signature files (signatures*.xml)
- Manifest files (META-INF/)

Our viewer extracts and verifies all components automatically.

If you want a deeper explanation of the format, see [What is an eDoc File?](/what-is-edoc). If you specifically need the container-standard view, use the [ASiC-E Reader](/asice-reader) page.
