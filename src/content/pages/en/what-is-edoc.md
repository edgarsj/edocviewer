---
title: "What is an eDoc File? Complete Guide to eDoc Format"
description: "Comprehensive guide to eDoc files - what they are, how they work, and why they're important for secure digital document exchange in the EU."
locale: "en"
pageType: "what-is-edoc"
defaultViewerLocale: "en"
alternates:
  en: "/what-is-edoc"
  lv: "/lv/kas-ir-edoc"
---

# What is an eDoc File?

An **eDoc file** is a digitally signed document container used for secure document exchange, primarily in Latvia and Estonia. It's based on the **ASiC-E** (Associated Signature Container Extended) standard.

## eDoc vs. Regular Documents

| Feature | Regular PDF/DOCX | eDoc Container |
|---------|------------------|----------------|
| **Digital Signatures** | Optional, embedded | Built-in, mandatory |
| **Multiple Files** | Single file only | Can contain many files |
| **Verification** | Limited | Full cryptographic validation |
| **Legal Status** | Depends on jurisdiction | Recognized across EU (eIDAS) |
| **Integrity** | Can be modified | Tamper-evident |

## Why Use eDoc?

### Legal Validity
eDoc files provide **non-repudiation** - the signer cannot deny having signed the document. This makes them legally binding across the European Union under the eIDAS regulation.

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

## How eDoc Files are Created

eDoc files are typically created using:

1. **eID Card Software** - Official applications provided by governments
   - Latvia: eParaksts Mobile/Smart-ID
   - Estonia: DigiDoc4
   - Belgium: itsme®

2. **Signing Portals** - Web-based signing services
3. **Enterprise Solutions** - Business document management systems

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

eDoc is based on:

- **ETSI TS 102 918** - ASiC specification
- **ETSI TS 101 903** - XAdES (XML Advanced Electronic Signatures)
- **eIDAS Regulation** - EU regulation on electronic identification
- **RFC 3161** - Time-Stamp Protocol (TSP)

## International Compatibility

While eDoc files are most common in the Baltic states, the underlying ASiC-E format is used across Europe:

- **European Union** - Recognized under eIDAS
- **Norway** - Government digital signatures
- **Switzerland** - E-government services
- **Other EU Members** - Various national implementations

## Privacy and Security

When using our viewer:

- ✅ **Document contents stay local** - Files are handled in your browser
- ✅ **No document uploads** - Your signed files are not uploaded to our servers
- ✅ **Open-source code** - Fully transparent and auditable
- ⚠️ **Online checks may still be used** - Full certificate and timestamp validation can contact trust-service endpoints

## Learn More

- [How to Open eDoc Files](/open-edoc-file)
- [ASiC-E Reader Technical Details](/asice-reader)
- [Compare Different Viewers](/compare-viewers)
