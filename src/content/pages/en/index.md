---
title: "eDoc Reader & ASiC-E File Reader Online | eDoc Viewer"
description: "Free eDoc reader and ASiC-E file reader. Open .edoc, .asice, and .sce files, inspect documents, and verify signatures in your browser."
locale: "en"
pageType: "main"
defaultViewerLocale: "en"
alternates:
  en: "/"
  lv: "/lv/"
---

# Free eDoc Reader and ASiC-E File Reader

Open `.edoc`, `.asice`, and `.sce` files directly in your browser. eDoc Viewer helps you inspect documents inside signed containers, review signer and certificate details, and verify signatures without uploading document contents.

- **Open eDoc and ASiC-E Containers** - Browse `.edoc`, `.asice`, and `.sce` files
- **Digital Signature Verification** - Validate XAdES signatures, certificate chains, and timestamps
- **Local Document Processing** - Document contents stay on your device while you inspect files
- **Offline App Support** - Install as a Progressive Web App (PWA) and keep the viewer available offline
- **Document Preview** - View PDFs, images, and DOCX files embedded inside containers
- **Certificate Details** - Inspect signer identity, issuer, validity period, and trust chain

## How It Works

Drag and drop your digitally signed file onto the viewer above, or click to browse. The viewer extracts the container locally in your browser, displays the included files, and checks signatures and certificate details. For full validation, certificate revocation and timestamp checks may use online trust-service endpoints.

## Supported Formats

This viewer handles common ASiC-E (Associated Signature Container Extended) file extensions:

- **`.edoc`** - eDoc extension used for ASiC-E containers in Latvia
- **`.asice`** - Generic ASiC-E extension used across the EU
- **`.sce`** - Alternative extension for the same ASiC-E container structure

All of these are ZIP-based electronic signature containers built on the ASiC-E format, so the same viewer workflow applies regardless of which extension you received.

## What Is an eDoc or ASiC-E File?

An eDoc file is a signed document container rather than a single document format. It can include one or more PDFs, images, or office documents together with signatures, timestamps, and metadata. If you want the technical background, see [What is an eDoc File?](/what-is-edoc) or the dedicated [ASiC-E Reader](/asice-reader) guide.

## Who Needs This

- Received a `.edoc`, `.asice`, or `.sce` file and need to open it
- Want to verify who signed a document and when
- Need to extract individual files from a signed container
- Looking for a browser-based way to inspect signed containers without uploading document contents

## FAQ

### What is an eDoc file?

An eDoc file is a signed document container based on the ASiC-E format. Instead of holding just one document, it can package documents, signatures, timestamps, and metadata together in a single file.

### How do I open an eDoc or ASiC-E file?

Drag the `.edoc`, `.asice`, or `.sce` file into the viewer above. The app will extract the container in your browser so you can inspect the included documents and signature details. For a step-by-step guide, see [How to Open and Verify an eDoc or ASiC-E File](/open-edoc-file).

### How do I verify an electronic signature?

Open the signed container in the viewer and review the signer, certificate, and timestamp information shown for each signature. For full live validation, the app may contact certificate revocation and timestamp services.

### What is the difference between `.edoc`, `.asice`, and `.sce`?

They are different filename extensions for the same general ASiC-E container approach. In practice, `.edoc` is commonly associated with Latvian eDoc files, while `.asice` is the broader standards-oriented extension and `.sce` is an alternative extension used by some systems.

### Are my document contents uploaded?

No. Document contents are processed in your browser and are not uploaded to our servers. Network requests may still be used for certificate status, revocation, or timestamp validation.

### Do I need internet to verify signatures?

You can open the container and inspect its contents locally. Internet access may still be needed for live certificate and timestamp checks, especially when you want stronger validation of signature status.

## Learn More

- [How to Open and Verify an eDoc or ASiC-E File](/open-edoc-file)
- [What is an eDoc File?](/what-is-edoc)
- [ASiC-E Reader Guide](/asice-reader)
- [Compare eDoc Viewers](/compare-viewers)
