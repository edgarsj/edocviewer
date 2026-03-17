---
title: "ASiC-E failu lasītājs | Atveriet .asice failus tiešsaistē"
description: "Bezmaksas tiešsaistes ASiC-E failu lasītājs .asice, .sce un Latvijas .edoc konteineriem. Skatiet dokumentus, pārbaudiet parakstus un izvelciet failus savā pārlūkā."
locale: "lv"
pageType: "asice-reader"
defaultViewerLocale: "lv"
alternates:
  en: "/asice-reader"
  lv: "/lv/asice-lasitajs"
---

# ASiC-E failu lasītājs

**ASiC-E** (Associated Signature Container Extended) ir konteinera formāts elektroniski parakstītiem failiem, ko izmanto Eiropas elektronisko parakstu darbplūsmās. Ja saņēmāt `.asice`, `.sce` vai Latvijas `.edoc` failu, varat to atvērt zemāk esošajā skatītājā un apskatīt saturu lokāli savā pārlūkā.

## Ātrā atbilde

Ja esat šeit, jo jums vajag **ASiC-E lasītāju**, izmantojiet šīs lapas skatītāju. Tas atver konteineru jūsu pārlūkā, lai jūs varētu apskatīt dokumentus, parakstus, sertifikātus un laika zīmogus, neaugšupielādējot dokumentu saturu uz mūsu serveriem. [Atveriet savu `.asice`, `.sce` vai `.edoc` failu skatītājā](#viewer).

## Kas ir ASiC-E?

ASiC-E ir ZIP bāzēts konteinera formāta fails, kas apvieno dokumentus ar elektroniskajiem parakstiem un metadatiem:

- **Konteinera formāts** — ZIP bāzēts arhīvs vairākiem failiem
- **Elektroniskie paraksti** — XAdES paraksti iegulti konteinerā
- **Pārbaude** — kriptogrāfiskā parakstu un sertifikātu validācija
- **Savietojamība** — darbojas dažādās ES eID sistēmās

## Failu paplašinājumi

ASiC-E failiem var būt dažādi paplašinājumi atkarībā no valsts:

- `.asice` — vispārīgs ASiC-E paplašinājums
- `.edoc` — Latvijas eDoc paplašinājums ASiC-E konteineriem
- `.sce` — dažas implementācijas

Visi šie paplašinājumi attiecas uz vienu un to pašu konteinera faila formātu un var tikt atvērti ar mūsu skatītāju.

## Ko šis lasītājs ļauj darīt

Izmantojiet šo ASiC-E lasītāju, lai:

- Atvērtu saņemtos `.asice`, `.sce` un `.edoc` failus
- Apskatītu failā glabātos dokumentus
- Pārbaudītu parakstītāja, sertifikāta un laika zīmoga informāciju
- Lejupielādētu atsevišķus dokumentus no konteinera faila
- Pārbaudītu parakstus lokāli savā pārlūkā

## ASiC-E faila struktūra

ASiC-E konteineris ir ZIP arhīvs ar šādu struktūru:

```
konteineris.asice
├── dokuments.pdf          # Oriģinālais dokuments(i)
├── attēls.jpg             # Var saturēt vairākus failus
├── META-INF/
│   ├── manifest.xml        # Failu saraksts
│   ├── signatures0.xml     # Elektroniskais paraksts(i)
│   └── ...
```

## Parakstu pārbaude

Mūsu ASiC-E lasītājs pārbauda:

- **Paraksta derīgumu** — kriptogrāfiskā paraksta pārbaude
- **Sertifikātu ķēdi** — uzticamības ķēdes (trust chain latviski :( ) validācija
- **Laika zīmogu** — norādīto paraksta izveides laika patiesumu
- **Sertifikāta derīgumu** — vai sertifikāts bija derīgs parakstīšanas brīdī

Dokumentu saturs atrodas tikai jūsu pārlūkā uz jūsu ierīces. Lasītājs pieslēdzas tiešsaistes sertifikātu un laika zīmogu servisiem, tikai pašu parakstu derīguma (vai nav atsaukti) un laika zīmogu pārbaudei.

## ASiC-E un eIDAS

ASiC-E ir konteinera formāts, ko izmanto kopā ar elektroniskajiem parakstiem saskaņā ar **eIDAS** ietvaru. Jūs to sastapsiet tādās jomās kā:

- Oficiāli dokumenti
- Līgumi un vienošanās
- Valsts pārvaldes komunikācijas
- Biznesa darījumi

Detalizētam atvēršanas ceļvedim skatiet [Kā atvērt un pārbaudīt eDoc vai ASiC-E failu](/lv/atvert-edoc-failu). Plašākam skaidrojumam lasiet [Kas ir eDoc fails? ASiC-E skaidrojums](/lv/kas-ir-edoc). Īsam rīku izvēles ceļvedim skatiet [Salīdzināt eDoc skatītājus](/lv/salidzinat-skatitajus).
