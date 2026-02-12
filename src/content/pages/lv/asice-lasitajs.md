---
title: "ASiC-E Lasītājs - Skatiet ASiC-E konteinerus tiešsaistē"
description: "Bezmaksas tiešsaistes ASiC-E lasītājs Associated Signature Container Extended failu skatīšanai. Pārbaudiet digitālos parakstus un izvelciet dokumentus."
locale: "lv"
pageType: "asice-reader"
defaultViewerLocale: "lv"
alternates:
  en: "/asice-reader"
  lv: "/lv/asice-lasitajs"
countryMentions: ["eParaksts", "Latvijas.lv"]
---

# ASiC-E Lasītājs

**ASiC-E** (Associated Signature Container Extended) ir standartizēts formāts digitāli parakstītu dokumentu konteineriem, ko izmanto visā Eiropas Savienībā.

## Kas ir ASiC-E?

ASiC-E ir definēts **ETSI TS 102 918** standartā un nodrošina:

- **Konteinera formāts** - ZIP bāzēts arhīvs vairākiem failiem
- **Digitālie paraksti** - XAdES paraksti iegulti konteinerā
- **Pārbaude** - Kriptogrāfiskā parakstu un sertifikātu validācija
- **Savietojamība** - Darbojas dažādās ES eID sistēmās

## Failu paplašinājumi

ASiC-E failiem var būt dažādi paplašinājumi atkarībā no valsts:

- `.asice` - Vispārīgs ASiC-E paplašinājums
- `.edoc` - Izmanto Latvijā un Igaunijā
- `.sce` - Dažas implementācijas

Visi šie formāti ir saderīgi un var tikt atvērti ar mūsu skatītāju.

## Izmantošana Latvijā

### eParaksts ekosistēma

Latvijā ASiC-E faili (ar .edoc paplašinājumu) ir standarta formāts, ko izmanto:

- **eParaksts Mobile** - mobilā parakstīšana
- **eParaksts Smart-ID** - parakstīšana ar Smart-ID
- **eParaksts Smartcard** - parakstīšana ar viedkartes lasītāju

### Latvijas.lv portāls

Valsts pakalpojumu portāls **Latvijas.lv** izmanto eDoc/ASiC-E formātu:

- Oficiālu dokumentu saņemšanai
- Iesniegumu parakstīšanai
- Komunikācijai ar valsts institūcijām

Visi šajā portālā lejupielādētie dokumenti var tikt atvērti ar šo skatītāju.

## ASiC-E faila struktūra

ASiC-E konteineris ir ZIP arhīvs ar šādu struktūru:

```
dokuments.asice
├── līgums.pdf              # Oriģinālais dokuments(i)
├── attēls.jpg              # Var saturēt vairākus failus
├── META-INF/
│   ├── manifest.xml        # Failu saraksts
│   ├── signatures0.xml     # Digitālais paraksts(i)
│   └── ...
```

## Paraksta pārbaude

Mūsu ASiC-E lasītājs pārbauda:

- **Paraksta derīgums** - Kriptogrāfiskā paraksta pārbaude
- **Sertifikātu ķēde** - Uzticamības ķēdes validācija
- **Laika zīmogs** - Paraksta izveides laiks
- **Sertifikāta derīgums** - Pārbauda, vai sertifikāts bija derīgs parakstīšanas brīdī

## eIDAS atbilstība

ASiC-E atbilst **eIDAS regulai** (Elektroniskā identifikācija un uzticamības pakalpojumi), padarot to juridiski atzītu visās ES dalībvalstīs:

- Oficiāliem dokumentiem
- Līgumiem un vienošanām
- Valdības komunikācijām
- Biznesa darījumiem

Latvijā tas nozīmē pilnu saderību ar eParaksts ekosistēmu un Latvijas.lv portālu.

Izmantojiet zemāk esošo skatītāju, lai atvērtu un pārbaudītu ASiC-E failus.
