---
title: "ASiC-E File Reader | Open .asice Files Online"
description: "Free online ASiC-E file reader for .asice, .sce, and Latvian .edoc containers. View documents, inspect signatures, and extract files in your browser."
locale: "en"
pageType: "asice-reader"
defaultViewerLocale: "en"
alternates:
  en: "/asice-reader"
  lv: "/lv/asice-lasitajs"
---

# ASiC-E File Reader

**ASiC-E** (Associated Signature Container Extended) is a container format for digitally signed files used in European electronic-signature workflows. If you received an `.asice`, `.sce`, or Latvian `.edoc` file, you can open it in the viewer below and inspect the contents locally in your browser.

## Quick Answer

If you are here because you need an **ASiC-E reader**, use the viewer on this page. It opens the container in your browser so you can inspect documents, signatures, certificates, and timestamps without uploading document contents to our servers. [Open your `.asice`, `.sce`, or `.edoc` file in the viewer below](#viewer).

## What is ASiC-E?

ASiC-E is a ZIP-based container that bundles documents with electronic signatures and metadata:

- **Container Format** - ZIP-based archive for multiple files
- **Digital Signatures** - XAdES signatures embedded within the container
- **Verification** - Cryptographic validation of signatures and certificates
- **Interoperability** - Works across different EU eID systems

## File Extensions

ASiC-E files can have different extensions depending on the country:

- `.asice` - Generic ASiC-E extension
- `.edoc` - Latvian eDoc extension for ASiC-E containers
- `.sce` - Some implementations

All these extensions refer to the same underlying container concept and can be opened with our viewer.

## What This Reader Lets You Do

Use this ASiC-E reader to:

- Open received `.asice`, `.sce`, and `.edoc` files
- Inspect the documents stored inside the container
- Check signer, certificate, and timestamp details
- Download individual files from the container
- Review signatures locally in your own browser session

## Structure of an ASiC-E File

An ASiC-E container is a ZIP archive with this structure:

```
container.asice
├── document.pdf          # Original document(s)
├── image.jpg             # Can contain multiple files
├── META-INF/
│   ├── manifest.xml      # File manifest
│   ├── signatures0.xml   # Digital signature(s)
│   └── ...
```

## Signature Verification

Our ASiC-E reader verifies:

- **Signature Validity** - Cryptographic signature check
- **Certificate Chain** - Trust chain validation
- **Timestamp** - Signature creation time
- **Certificate Validity** - Check if certificate was valid at signing time

Document contents stay local in your browser on your device. When deeper live validation is available, the reader may still contact certificate, revocation, or timestamp services for the signature-checking part.

## ASiC-E and eIDAS

ASiC-E is the container format used with electronic signatures under the **eIDAS** framework. You'll encounter it in workflows like:

- Official documents
- Contracts and agreements
- Government communications
- Business transactions

For step-by-step opening instructions, see [How to Open and Verify an eDoc or ASiC-E File](/open-edoc-file). If you want the broader explainer, read [What Is an eDoc File? ASiC-E Explained](/what-is-edoc). For a short tool-choice guide, see [Compare eDoc Viewers](/compare-viewers).
