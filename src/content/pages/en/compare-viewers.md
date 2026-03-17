---
title: "Compare eDoc and ASiC-E Viewers"
description: "Decide whether to use a browser viewer, desktop signing app, or official validator for eDoc and ASiC-E files."
locale: "en"
pageType: "compare-viewers"
defaultViewerLocale: "en"
alternates:
  en: "/compare-viewers"
  lv: "/lv/salidzinat-skatitajus"
---

# Compare eDoc and ASiC-E Viewers

The right tool depends on what you need to do. There are really only three options:

## Quick Answer

- **Browser viewer**: best when you just need to open the file, inspect documents, and review signatures quickly.
- **Desktop signing app**: best when you need to sign documents, use smart cards, or handle recurring professional workflows.
- **Official/provider-run web service**: best when you need a provider-specific signing or validation flow, or a workflow tied to a public authority or trust-service platform.

## Decision Table

| Option | Best for | Installation | Can sign documents | Validation style | Typical behavior |
|--------|----------|--------------|--------------------|------------------|-----------------|
| **Browser viewer** | Opening and inspecting received files | None | No | Practical document and signature review | Document contents stay local; live validation checks may still contact trust services |
| **Desktop signing app** | Signing, smart-card workflows, repeated use | Required | Usually yes | Full workflow tool | Local or hybrid workflow, depending on the app and credential type |
| **Official/provider-run web service** | Provider-specific signing or validation flows | None | Often yes, but varies by service | Service-specific | Usually server-side, redirect-based, or provider-mediated |

## Important Caveat

What a tool can do depends more on your signing method and setup than on the tool label:

- **Your credential** — smart card, eID, mobile certificate, or cloud signing
- **The provider** — some use browser redirects, some have APIs, some sign server-side
- **Your scale** — opening one file you received vs. integrating a full document workflow

## Which Option Should You Choose?

### I just need to open an eDoc file someone sent me

Use a **browser viewer**. This is the fastest option when you want to inspect the contents, identify who signed the file, and download the individual documents inside the signed file container.

### I need to sign documents or use a national eID workflow

Use a **desktop signing app** or an **official/provider web service**. The right choice depends on whether your signing method is card-based, mobile-app-based, cloud-based, or tied to a specific national or provider portal.

### I need an official validation result

Use an **official/provider web service**. If a public authority, trust-service provider, or business process expects a specific validation result, use the validator or portal required by that workflow.

### I am on a work laptop, borrowed computer, or phone

Use a **browser viewer**. It avoids installation and is usually the simplest way to open a received `.edoc`, `.asice`, or `.sce` file.

### I work with large batches or regular signing tasks

This depends more on the **provider and credential type** than on web vs desktop alone. Use the signing platform, integration flow, or document-management workflow designed for that setup.

## Where eDoc Viewer Fits

eDoc Viewer is best when you want:

- Fast access in any modern browser — no software to install or update
- Local handling of document contents
- Quick inspection of signatures, certificates, and timestamps
- A simple way to open `.edoc`, `.asice`, and `.sce` files

If that matches your use case, [open your file in the viewer below](#viewer).

eDoc Viewer is not the right choice when you need:

- Document signing
- Hardware-token or smart-card workflows
- A validation result from a specific official portal or authority
- A system tailored to a mandatory enterprise workflow

## Examples of Official or Provider-Run Web Tools

- **[eParaksts (Latvia)](https://www.eparaksts.lv/en/)**: relevant when you need Latvian eDoc/ASiC-E signing or validation workflows tied to the eParaksts ecosystem. The main site exposes the sign and validate flows directly.
- **[European Commission DSS Demonstration WebApp](https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/validation)**: useful as a standards-oriented testing and exploration tool, but the Commission explicitly says it is a demonstration and not intended as a production signature creation or validation service.

## Related Guides

- [How to Open and Verify an eDoc or ASiC-E File](/open-edoc-file)
- [What Is an eDoc File? ASiC-E Explained](/what-is-edoc)
- [ASiC-E File Reader](/asice-reader)
