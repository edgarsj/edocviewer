---
title: "How to Open and Verify an eDoc or ASiC-E File Online"
description: "Learn how to open and verify .edoc, .asice, and .sce files online, inspect attachments, and check digital signatures in your browser."
locale: "en"
pageType: "open-edoc-file"
defaultViewerLocale: "en"
alternates:
  en: "/open-edoc-file"
  lv: "/lv/atvert-edoc-failu"
---

# How to Open and Verify an eDoc or ASiC-E File

An **eDoc file** is an ASiC-E-based container for digitally signed documents. If you received an `.edoc`, `.asice`, or `.sce` file, you can open it in your browser, inspect the signed contents, and review signature details without installing desktop software. The document contents stay in your browser on your device and are not uploaded to our servers.

## Quick Answer

If you only need to open a signed file and inspect what is inside, the browser viewer below is usually the fastest option. It runs locally in your browser — your files stay on your device. [Open your `.edoc`, `.asice`, or `.sce` file in the viewer below](#viewer). If you need to create signatures, use a desktop signing app or other official web based signing tools. If you need an official or jurisdiction-specific validation record, use the validator recommended by the relevant trust-service provider or public authority.

## Step-by-Step: Open and Verify the File

1. **Drag and drop** your `.edoc`, `.asice`, or `.sce` file onto the viewer
2. The file will be **opened locally in your browser** and extracted on your device
3. **Review the documents inside** the container without uploading them anywhere
4. **Check the signatures** to see signer, certificate, and timestamp information
5. **Save** individual files if needed

Your files stay on your device. For full signature validation, the app may contact certificate and timestamp services online.

## What You Can Check

After opening the file, you can usually:

- See all attached documents inside the signed container
- Inspect signer identity and certificate details
- Check the document integrity (whether is signed and unchanged)  while keeping the file contents local
- Review timestamp information when present
- Extract individual files from the container

## Open eDoc Files Instantly (PWA)

If you open `.edoc` or `.asice` files regularly, install eDoc Viewer as a Progressive Web App for the fastest workflow:

1. Open eDoc Viewer in Chrome
2. Click the install icon in the address bar (or use the menu → "Install eDoc Viewer")
3. Once installed, Chrome can associate `.edoc`, `.asice`, and `.sce` files with the app
4. From then on, **double-click any eDoc file** and it opens immediately in the viewer

This is the closest thing to a native desktop app without installing one — it launches instantly, works offline, and handles file associations so you never have to drag-and-drop again. It's especially useful for quickly previewing PDFs and DOCX files inside signed containers without having to extract and open them separately.

## When to Use Another Tool

Use a different tool when your goal is not just opening and inspecting the file:

- **Need to sign a new document** - Use a desktop signing application
- **Need an official validation record** - Use the official validator or portal relevant to that workflow
- **Need an integration with your document management workflow?** [zenomy.tech](https://zenomy.tech/) builds custom eDoc/ASiC-E signing and workflow integrations for business systems.

For the short decision version, see [Compare eDoc Viewers](/compare-viewers).

## What Is Inside an eDoc or ASiC-E File?

eDoc files use the **ASiC-E** (Associated Signature Container Extended) format, which is a ZIP-based container that can include:

- Original documents (PDF, DOCX, images, etc.)
- XML signature files (signatures*.xml)
- Manifest files (META-INF/)

Our viewer extracts and inspects these components automatically.

If you want a deeper explanation of the format, see [What Is an eDoc File? ASiC-E Explained](/what-is-edoc). If you specifically need the container-standard view, use the [ASiC-E Reader](/asice-reader) page.
