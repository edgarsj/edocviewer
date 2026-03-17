---
title: "Kas ir eDoc fails? ASiC-E skaidrojums"
description: "Uzziniet, kas ir eDoc fails, kā tas saistās ar ASiC-E, kas ir konteinera iekšienē un kā tiek pārbaudīti parakstītie faili."
locale: "lv"
pageType: "what-is-edoc"
defaultViewerLocale: "lv"
alternates:
  en: "/what-is-edoc"
  lv: "/lv/kas-ir-edoc"
---

# Kas ir eDoc fails? ASiC-E skaidrojums

**eDoc fails** ir elektroniski parakstīts dokumentu konteineris. Praksē `.edoc` ir failu paplašinājums, ko izmanto ASiC-E bāzētiem parakstītajiem konteineriem, bet `.asice` ir plašāks formātam orientēts paplašinājums un `.sce` ir alternatīvs paplašinājums, ko izmanto dažas sistēmas. Pamatideja ir viena un tā pati: apvienot dokumentus un parakstus vienā pret izmaiņām aizsargātā paketē.

## eDoc vs. parasts dokuments

| Funkcija | Parasts PDF/DOCX | eDoc konteineris |
|---------|------------------|----------------|
| **Elektroniskie paraksti** | Izvēles, iegulti | Iebūvēti, obligāti |
| **Vairāki faili** | Tikai viens fails | Var saturēt daudzus failus |
| **Pārbaude** | Ierobežota | Pilna kriptogrāfiskā validācija |
| **Juridiskais konteksts** | Atkarīgs no dokumenta darbplūsmas | Veidots eIDAS elektroniskajiem parakstiem |
| **Integritāte** | Var tikt modificēts | Aizsargāts pret izmaiņām |

## Kāpēc izmantot eDoc vai ASiC-E?

### Paraksta pierādījums
Parakstīti konteineri saglabā informāciju par to, kas parakstīja, ko parakstīja un kad parakstīja. Šie pierādījumi ir svarīgi auditam, atbilstībai un formālai dokumentu apmaiņai.

### Drošība
- **Izmaiņu noteikšana** — jebkuras izmaiņas padara parakstu nederīgu
- **Autentifikācija** — pārbaudiet parakstītāja identitāti
- **Integritāte** — pārliecinieties, ka dokuments nav mainīts

### Ērtība
- **Apvienot vairākus failus** — parakstiet vairākus dokumentus vienlaikus
- **Iekļaut pielikumus** — saglabājiet saistītos failus kopā
- **Ilgtermiņa validācija** — laika zīmogi nodrošina, ka paraksti paliek pārbaudāmi gadiem vēlāk

## Izplatīti lietošanas gadījumi

### Valsts pakalpojumi
- Oficiāli dokumenti no valsts iestādēm
- Nodokļu deklarācijas un pārskati
- Juridiski paziņojumi un lēmumi

### Bizness
- Līgumi un vienošanās
- Rēķini ar juridisku nozīmi
- Arhivēta korespondence

### Personīgi
- Īpašuma dokumenti
- Notariāli apliecināti dokumenti
- Svarīgi personiskie ieraksti

## Kā tiek izveidoti eDoc faili

eDoc failus parasti izveido, izmantojot:

1. **Darbvirsmas parakstīšanas lietotnes**, ko nodrošina uzticamības pakalpojumu vai eID ekosistēmas
2. **Parakstīšanas portālus**, ko izmanto valsts iestādes vai privāti pakalpojumi
3. **Uzņēmumu sistēmas**, kas ģenerē vai apstrādā parakstītus konteinerus

## Faila struktūra

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

- **Datu faili** — jūsu faktiskie dokumenti (PDF, Office faili, attēli u.c.)
- **Manifests** — visu failu indekss konteinerā
- **Paraksti** — XAdES XML paraksti, kas satur:
  - Parakstītāja sertifikātu
  - Kriptogrāfisku parakstu
  - Laika zīmogu (izvēles, bet ieteicams)
  - Parakstīšanas laiku

## Kā darbojas uzticamība

Augstā līmenī eDoc/ASiC-E paraksts darbojas šādi:

```text
Dokumentu faili
    |
    v
Tiek aprēķinātas parakstītā satura čeksummas (hashes / checksums)
    |
    v
Parakstītāja privātā atslēga izveido paraksta vērtību
    |
    v
Paraksts satur atsauces uz parakstīto saturu
un parasti iekļauj parakstītāja publisko sertifikātu
    |
    v
Neobligāts laika zīmogs pierāda, ka paraksts eksistēja noteiktā brīdī
    |
    v
Validators pārbauda:
- vai failu čeksummas joprojām sakrīt
- vai sertifikāta publiskā atslēga atbilst parakstam
- vai sertifikātu ķēde ved pie uzticamas CA (certificate authority? latviski)
- vai uzticamības sarakstu / atsaukšanas / laika zīmogu pārbaudes ir korektas
```

Vienkāršos vārdos:

- **Sertifikāts** norāda, kura publiskā atslēga pieder parakstītājam
- **Paraksts** pierāda, ka atbilstošā privātā atslēga apstiprināja parakstīto saturu
- **Čeksummu pārbaude** pierāda, ka faili nav mainīti kopš parakstīšanas
- **Laika zīmogs** var pierādīt, kad paraksts eksistēja
- **Uzticamības lēmums (šis izklausās reāli sūdīgi) ** izriet no sertifikātu ķēdes validācijas un pārbaudes, vai paraksta izdevēja ir uzticamo (parasti ES līmenī pieņemto) servisu sarakstā

Eiropā validatori pārbauda nacionālos un ES uzticamo sarakstus, lai izlemtu, vai sertifikātu izdevējs ir uzticams. Publiska atsauce ir [ES uzticamo sarakstu pārlūks](https://eidas.ec.europa.eu/efda/trust-services/browse/eidas/tls/search/type?step=1).

## Parakstu tipi

eDoc atbalsta dažādus parakstu līmeņus:

### XAdES-B (pamata)
- Pamata paraksts ar sertifikātu
- Validē parakstīšanas brīdī

### XAdES-T (ar laika zīmogu)
- Iekļauj uzticamu laika zīmogu
- Pierāda, kad dokuments tika parakstīts

### XAdES-LT (ilgtermiņa)
- Iekļauj sertifikātu ķēdi un atsaukšanas datus
- Var validēt gadiem vēlāk

### XAdES-LTA (ilgtermiņa arhīvs)
- Arhīva laika zīmogi ilgtermiņa saglabāšanai
- Izmanto dokumentiem, kam jāpaliek derīgiem gadu desmitiem

## eDoc failu atvēršana un pārbaude

Izmantojiet šīs lapas skatītāju, lai:

1. **Redzētu saturu** — apskatiet visus dokumentus parakstītajā konteinerfailā 
2. **Pārbaudītu parakstus** — pārbaudiet kriptogrāfisko derīgumu
3. **Apskatītu sertifikātus** — redzoet, kas parakstīja dokumentu
4. **Pārbaudītu laika zīmogus** — pārbaudiet, kad notika parakstīšana
5. **Lejupielādētu failus** — izvelciet atsevišķus dokumentus

## Tehniskie standarti

eDoc/ASiC-E faili parasti balstās uz:

- **ASiC / ASiC-E konteineru specifikācijām** no ETSI
- **XAdES elektroniskajiem parakstiem** XML bāzētiem parakstu datiem
- **RFC 3161 laika zīmogiem**, kad tiek izmantota uzticama laika zīmogošana
- **eIDAS** — ES tiesiskais ietvars elektroniskajiem parakstiem un uzticamības pakalpojumiem

## Starptautiskā saderība

Lai gan `.edoc` galvenokārt asociējas ar Latvijas eDoc infrastruktūru, ASiC-E formāts tiek izmantots visās Eiropas elektronisko parakstu sistēmās:

- **Eiropas Savienība** — ASiC-E ir standarta konteinera formāts pārrobežu elektroniskajiem parakstiem
- **Latvija** — `.edoc` ir valstij specifiskais paplašinājums, ar ko lietotāji visbiežāk saskaras praksē
- **Citas Eiropas darbplūsmas** — vairākas valstis izmanto ASiC-E konteinerus valsts pārvaldes un regulētajās darbplūsmās

## Privātums un drošība

Izmantojot mūsu skatītāju:

- ✅ **Dokumentu saturs paliek lokāls** — faili tiek apstrādāti jūsu pārlūkā
- ✅ **Dokumenti netiek augšupielādēti** — jūsu parakstītie faili netiek sūtīti uz mūsu serveriem
- ✅ **Atvērtā pirmkoda** — pilnībā pārredzams un auditējams kods
- ⚠️ **Tiešsaistes pārbaudes** — pilnai parakstu un laika zīmogu validācijai nepieciešama sazinņa ar sertifikātu un laika zīmogu pakalpojumu serveriem

## Izstrādātājiem

Ja jums nepieciešams programmatiski parsēt vai verificēt šos konteinerus, eDoc Viewer ir veidots uz [edockit](https://github.com/edgarsj/edockit) — atvērtā pirmkoda bibliotēkas darbam ar ASiC-E un eDoc failiem.

## Uzzināt vairāk

- [Kā atvērt un pārbaudīt eDoc vai ASiC-E failu](/lv/atvert-edoc-failu)
- [ASiC-E lasītāja informācija](/lv/asice-lasitajs)
- [Salīdzināt dažādus skatītājus](/lv/salidzinat-skatitajus)
