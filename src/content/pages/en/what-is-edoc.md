---
title: "What Is an eDoc File? ASiC-E Explained"
description: "Learn what an eDoc file is, how it relates to ASiC-E, what is inside the container, and how signed files are verified."
locale: "en"
pageType: "what-is-edoc"
defaultViewerLocale: "en"
alternates:
  en: "/what-is-edoc"
  lv: "/lv/kas-ir-edoc"
---

# What Is an eDoc File? ASiC-E Explained

An **eDoc file** is a digitally signed document container. In practical terms, `.edoc` is a filename extension used for ASiC-E-based signed containers, while `.asice` is the broader format-oriented extension and `.sce` is an alternative extension used by some systems. The underlying idea is the same: bundle documents and signatures together in one tamper-evident package.

## eDoc vs. a Regular Document

| Feature | Regular PDF/DOCX | eDoc Container |
|---------|------------------|----------------|
| **Digital Signatures** | Optional, embedded | Built-in, mandatory |
| **Multiple Files** | Single file only | Can contain many files |
| **Verification** | Limited | Full cryptographic validation |
| **Legal Context** | Depends on document workflow | Can support eIDAS-relevant electronic signatures |
| **Integrity** | Can be modified | Tamper-evident |

## Why Use eDoc or ASiC-E?

### Signature Evidence
Signed containers can preserve who signed, what was signed, and when it was signed. Depending on the certificate, signature type, and workflow, that evidence can be important for audit, compliance, and formal document exchange.

### Security
- **Tamper Detection** - Any modification invalidates the signature
- **Authentication** - Verify the identity of the signer
- **Integrity** - Ensure the document hasn't been altered

### Convenience
- **Bundle Multiple Files** - Sign several documents at once
- **Include Attachments** - Keep related files together
- **Long-term Validation** - Timestamps ensure signatures remain verifiable years later

## Common Use Cases

### Government Services
- Official documents from public authorities
- Tax filings and declarations
- Legal notices and decisions

### Business
- Contracts and agreements
- Invoices with legal significance
- Archived correspondence

### Personal
- Property documents
- Notarized documents
- Important personal records

## How eDoc Files Are Created

eDoc files are typically created using:

1. **Desktop signing applications** provided by trust-service or eID ecosystems
2. **Signing portals** used by public authorities or private services
3. **Enterprise systems** that generate or process signed containers

## File Structure Explained

An eDoc file is essentially a ZIP archive with a specific structure:

```
document.edoc
├── contract.pdf              # Your original document(s)
├── appendix.docx             # Additional files
├── META-INF/
│   ├── manifest.xml          # Lists all files
│   ├── signatures0.xml       # First signature
│   ├── signatures1.xml       # Second signature (if multiple signers)
│   └── ASiCArchiveManifest.xml
```

### Components

- **Data Files** - Your actual documents (PDF, Office files, images, etc.)
- **Manifest** - Index of all files in the container
- **Signatures** - XAdES XML signatures containing:
  - Signer's certificate
  - Cryptographic signature
  - Timestamp (optional but recommended)
  - Signing time

## How Trust Works

At a high level, an eDoc/ASiC-E signature works like this:

```text
Document files
    |
    v
Hashes/digests are calculated for the signed content
    |
    v
The signer's private key creates the signature value
    |
    v
The signature carries references to the signed content
and usually includes the signer's certificate
    |
    v
Optional timestamp proves the signature existed at a given time
    |
    v
The validator checks:
- the file hashes still match
- the certificate's public key matches the signature
- the certificate chain leads to a trusted CA
- trust lists / revocation / timestamp checks pass when available
```

In plain language:

- The **certificate** tells you which public key belongs to the signer
- The **signature** proves the corresponding private key approved the signed content
- The **hashes/digests** prove the files have not been changed since signing
- The **timestamp** can prove when the signature existed
- The **trust decision** comes from validating the certificate chain and checking whether the issuing trust service is on a relevant trusted list

In European trust-service workflows, validators often rely on national and EU trusted lists to decide whether a certificate authority should be trusted for electronic signatures. A public reference point is the [EU trusted list browser](https://eidas.ec.europa.eu/efda/trust-services/browse/eidas/tls/search/type?step=1).

## Signature Types

eDoc supports different signature levels:

### XAdES-B (Basic)
- Basic signature with certificate
- Validates at the time of signing

### XAdES-T (with Timestamp)
- Includes trusted timestamp
- Proves when the document was signed

### XAdES-LT (Long-Term)
- Includes certificate chain and revocation data
- Can be validated years later

### XAdES-LTA (Long-Term Archive)
- Archive timestamps for long-term preservation
- Used for documents that must remain valid for decades

## Opening and Verifying eDoc Files

Use the viewer on this page to:

1. **Extract Contents** - See all files inside the container
2. **Verify Signatures** - Check cryptographic validity
3. **View Certificates** - See who signed the document
4. **Check Timestamps** - Verify when signing occurred
5. **Download Files** - Extract individual documents

## Technical Standards

eDoc/ASiC-E files are typically built around:

- **ASiC / ASiC-E container specifications** from ETSI
- **XAdES electronic signatures** for XML-based signature data
- **RFC 3161 timestamps** when trusted timestamping is used
- **eIDAS** as the EU legal framework often discussed alongside these signatures

## International Compatibility

While `.edoc` is primarily associated with Latvian eDoc workflows, the underlying ASiC-E approach is used more broadly in European electronic-signature ecosystems:

- **European Union** - Cross-border signature and trust-service discussions often refer to ASiC-E
- **Latvia** - `.edoc` is the country-specific extension most users encounter in practice
- **Other European workflows** - Similar signed-container approaches appear in public-sector and regulated exchanges

## Privacy and Security

When using our viewer:

- ✅ **Document contents stay local** - Files are handled in your browser
- ✅ **No document uploads** - Your signed files are not uploaded to our servers
- ✅ **Open-source code** - Fully transparent and auditable
- ⚠️ **Online checks may still be used** - Full certificate and timestamp validation can contact trust-service endpoints

## For Developers

If you need to parse or verify these containers programmatically, eDoc Viewer is built on [edockit](https://github.com/edgarsj/edockit), an open-source library for working with ASiC-E and eDoc files.

## Learn More

- [How to Open and Verify an eDoc or ASiC-E File](/open-edoc-file)
- [ASiC-E Reader Technical Details](/asice-reader)
- [Compare Different Viewers](/compare-viewers)
