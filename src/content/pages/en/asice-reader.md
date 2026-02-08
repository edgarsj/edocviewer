---
title: "ASiC-E Reader - View ASiC-E Containers Online"
description: "Free online ASiC-E reader for viewing Associated Signature Container Extended files. Verify digital signatures and extract documents."
locale: "en"
pageType: "asice-reader"
defaultViewerLocale: "en"
alternates:
  en: "/asice-reader"
  lv: "/lv/asice-lasitajs"
---

# ASiC-E Reader

**ASiC-E** (Associated Signature Container Extended) is a standardized format for digitally signed document containers used across the European Union.

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
- `.bdoc` - Legacy extension (Estonia)
- `.sce` - Some implementations

All these formats are compatible and can be opened with our viewer.

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
