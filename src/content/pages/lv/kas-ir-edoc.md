---
title: "Kas ir eDoc fails? Pilns ceļvedis eDoc formātam"
description: "Visaptverošs ceļvedis eDoc failiem - kas tie ir, kā tie darbojas un kāpēc tie ir svarīgi drošai dokumentu apmaiņai ES."
locale: "lv"
pageType: "what-is-edoc"
defaultViewerLocale: "lv"
alternates:
  en: "/what-is-edoc"
  lv: "/lv/kas-ir-edoc"
countryMentions: ["eParaksts", "Latvijas.lv"]
---

# Kas ir eDoc fails?

**eDoc fails** ir digitāli parakstīts dokumentu konteineris, ko izmanto drošai dokumentu apmaiņai, galvenokārt Latvijā un Igaunijā. Tas ir balstīts uz **ASiC-E** (Associated Signature Container Extended) standartu.

## eDoc vs. parasti dokumenti

| Funkcija | Parasts PDF/DOCX | eDoc konteineris |
|---------|------------------|----------------|
| **Digitālie paraksti** | Izvēles, iegults | Iebūvēts, obligāts |
| **Vairāki faili** | Tikai viens fails | Var saturēt daudzus failus |
| **Pārbaude** | Ierobežota | Pilna kriptogrāfiskā validācija |
| **Juridiskais statuss** | Atkarīgs no jurisdikcijas | Atzīts visā ES (eIDAS) |
| **Integritāte** | Var tikt modificēts | Aizsargāts pret izmaiņām |

## Kāpēc izmantot eDoc?

### Juridiskā spēkā esamība
eDoc faili nodrošina **nenoliedzamību** - parakstītājs nevar noliegt dokumenta parakstīšanu. Tas padara tos juridiski saistošus visā Eiropas Savienībā saskaņā ar eIDAS regulu.

### Drošība
- **Izmaiņu noteikšana** - Jebkuras izmaiņas padara parakstu nederīgu
- **Autentifikācija** - Pārbaudiet parakstītāja identitāti
- **Integritāte** - Pārliecinieties, ka dokuments nav mainīts

### Ērtība
- **Apvienot vairākus failus** - Parakstiet vairākus dokumentus vienlaikus
- **Iekļaut pielikumus** - Saglabājiet saistītos failus kopā
- **Ilgtermiņa validācija** - Laika zīmogi nodrošina, ka paraksti paliek pārbaudāmi gadiem vēlāk

## Izplatīti lietošanas gadījumi Latvijā

### Valdības pakalpojumi

- **Latvijas.lv portāls** - Oficiāli dokumenti no valsts iestādēm
- Nodokļu deklarācijas un pārskati
- Juridiski paziņojumi un lēmumi
- Pieteikumi valsts pakalpojumiem

### eParaksts ekosistēma

eDoc faili ir primārais formāts, ko izmanto ar:

- **eParaksts Mobile** - Mobilā parakstīšanas lietotne
  - Parakstiet dokumentus ar tālruni
  - Saņemiet parakstītus dokumentus .edoc formātā

- **eParaksts Smart-ID** - Parakstīšana ar Smart-ID
  - Droša identifikācija un parakstīšana
  - Saderīgs ar visiem Latvijas e-pakalpojumiem

- **eParaksts Smartcard** - Viedkaršu risinājums
  - Izmanto ar karšu lasītāju
  - Augstākais drošības līmenis

### Bizness

- Līgumi un vienošanās
- Rēķini ar juridisku nozīmi
- Arhivēta korespondence
- Līgumi ar elektronisko parakstu

### Personīgais

- Īpašuma dokumenti
- Notariāli apliecināti dokumenti
- Svarīgi personiskie ieraksti

## Kā tiek izveidoti eDoc faili

eDoc failus parasti izveido, izmantojot:

### Latvijā
1. **eParaksts Mobile** - Oficiālā mobilā lietotne
2. **eParaksts Smart-ID** - Smart-ID parakstīšana
3. **Latvijas.lv** - Valsts pakalpojumu portāls
4. **eParaksts Smartcard** - Viedkaršu programmatūra

### Citas valstis
- Igaunija: DigiDoc4
- Lietuva: RCSC Viewer
- Citas ES valstis: Vietējie risinājumi

## Faila struktūra paskaidrota

eDoc fails būtībā ir ZIP arhīvs ar specifisku struktūru:

```
dokuments.edoc
├── līgums.pdf                # Jūsu oriģinālais dokuments(i)
├── pielikums.docx            # Papildu faili
├── META-INF/
│   ├── manifest.xml          # Uzskaita visus failus
│   ├── signatures0.xml       # Pirmais paraksts
│   ├── signatures1.xml       # Otrais paraksts (ja vairāki parakstītāji)
│   └── ASiCArchiveManifest.xml
```

### Komponenti

- **Datu faili** - Jūsu faktiskie dokumenti (PDF, Office faili, attēli, u.c.)
- **Manifest** - Visu failu indekss konteinerā
- **Paraksti** - XAdES XML paraksti, kas satur:
  - Parakstītāja sertifikāts
  - Kriptogrāfisks paraksts
  - Laika zīmogs (izvēles, bet ieteicams)
  - Parakstīšanas laiks

## Parakstu tipi

eDoc atbalsta dažādus parakstu līmeņus:

### XAdES-B (Pamata)
- Pamata paraksts ar sertifikātu
- Validē parakstīšanas brīdī

### XAdES-T (ar laika zīmogu)
- Iekļauj uzticamu laika zīmogu
- Pierāda, kad dokuments tika parakstīts

### XAdES-LT (Ilgtermiņa)
- Iekļauj sertifikātu ķēdi un atsaukšanas datus
- Var validēt gadiem vēlāk

### XAdES-LTA (Ilgtermiņa arhīvs)
- Arhīva laika zīmogi ilgtermiņa saglabāšanai
- Izmanto dokumentiem, kam jāpaliek derīgiem gadu desmitiem

## eDoc failu atvēršana un pārbaude

Izmantojiet šīs lapas skatītāju, lai:

1. **Izvilktu saturu** - Skatiet visus failus konteinerā
2. **Pārbaudītu parakstus** - Pārbaudiet kriptogrāfisko derīgumu
3. **Skatītu sertifikātus** - Skatiet, kas parakstīja dokumentu
4. **Pārbaudītu laika zīmogus** - Pārbaudiet, kad notika parakstīšana
5. **Lejupielādētu failus** - Izvelciet atsevišķus dokumentus

## Saderība ar eParaksts

Šis skatītājs pilnībā atbalsta:

- ✅ **eParaksts Mobile** parakstītus dokumentus
- ✅ **eParaksts Smart-ID** parakstītus dokumentus
- ✅ **eParaksts Smartcard** parakstītus dokumentus
- ✅ **Latvijas.lv** portālā izveidotos dokumentus
- ✅ Visus standarta ASiC-E/XAdES formāta failus

## Privātums un drošība

Izmantojot mūsu skatītāju:

- ✅ **Visa apstrāde ir lokāla** - Faili nekad neatstāj jūsu ierīci
- ✅ **Nav augšupielādes uz serveriem** - Viss notiek jūsu pārlūkā
- ✅ **Atvērtā pirmkoda** - Pilnībā pārredzams un auditējams kods
- ✅ **Darbojas bezsaistē** - Instalējiet kā PWA pilnīgai privātumam

Tas ir īpaši svarīgi, strādājot ar sensitīviem dokumentiem no Latvijas.lv vai eParaksts sistēmām.

## Uzziniet vairāk

- [Kā atvērt eDoc failus](/lv/atvert-edoc-failu)
- [ASiC-E lasītāja tehniskie detaļi](/lv/asice-lasitajs)
- [Salīdzināt dažādus skatītājus](/lv/salidzinat-skatitajus)
