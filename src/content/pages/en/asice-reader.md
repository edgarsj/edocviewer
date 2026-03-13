---
title: "ASiC-E File Reader - Open ASiC-E Containers Online"
description: "Free online ASiC-E file reader for .asice, .edoc, and .sce containers. View documents, inspect signatures, and extract files."
locale: "en"
pageType: "asice-reader"
defaultViewerLocale: "en"
alternates:
  en: "/asice-reader"
  lv: "/lv/asice-lasitajs"
---

# ASiC-E File Reader

**ASiC-E** (Associated Signature Container Extended) is a container format for digitally signed files used in European electronic-signature workflows. This page is the quick technical overview for `.asice`, `.edoc`, and `.sce` containers.

## What is ASiC-E?

ASiC-E is defined by the **ETSI TS 102 918** standard and provides:

- **Container Format** - ZIP-based archive for multiple files
- **Digital Signatures** - XAdES signatures embedded within the container
- **Verification** - Cryptographic validation of signatures and certificates
- **Interoperability** - Works across different EU eID systems

## File Extensions

ASiC-E files can have different extensions depending on the country:

- `.asice` - Generic ASiC-E extension
- `.edoc` - Used in Latvia and Estonia
- `.sce` - Some implementations

All these extensions refer to the same underlying container concept and can be opened with our viewer.

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

## EU eIDAS Compliance

ASiC-E is compliant with the **eIDAS regulation** (Electronic Identification and Trust Services), making it legally recognized across all EU member states for:

- Official documents
- Contracts and agreements
- Government communications
- Business transactions

Use the viewer below to open and inspect ASiC-E files.

If you want the eDoc-focused explanation, read [What is an eDoc File?](/what-is-edoc). If you just need step-by-step instructions, see [How to Open an eDoc File](/open-edoc-file). For a side-by-side tool breakdown, see [Compare Viewers](/compare-viewers).
