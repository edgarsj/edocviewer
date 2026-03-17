---
title: "Salīdzināt eDoc un ASiC-E skatītājus"
description: "Izlemiet, vai izmantot pārlūka skatītāju, darbvirsmas parakstīšanas lietotni vai oficiālu validatoru eDoc un ASiC-E failiem."
locale: "lv"
pageType: "compare-viewers"
defaultViewerLocale: "lv"
alternates:
  en: "/compare-viewers"
  lv: "/lv/salidzinat-skatitajus"
---

# Salīdzināt eDoc un ASiC-E skatītājus

Pareizais rīks ir atkarīgs no tā, kas jums jādara. Ir trīs pamatvarianti:

- **Pārlūka skatītājs** — kad jums vienkārši jāatver fails, jāapskata dokumenti un ātri jāpārskata paraksti.
- **Darbvirsmas parakstīšanas lietotne** — kad jāparaksta dokumenti, jāizmanto viedkartes vai regulāras profesionālas darbplūsmas.
- **Oficiāls/pakalpojuma sniedzēja tīmekļa pakalpojums** — kad nepieciešama pakalpojuma sniedzējam specifiska parakstīšanas vai validācijas plūsma, vai darbplūsma, kas saistīta ar valsts iestādi vai uzticamības pakalpojumu platformu.

## Lēmumu tabula

| Variants | Labākais | Instalācija | Var parakstīt | Validācijas stils | Tipiskā uzvedība |
|----------|----------|-------------|---------------|-------------------|-----------------|
| **Pārlūka skatītājs** | Saņemto failu atvēršana un apskatīšana | Nav | Nē | Praktiska dokumentu un parakstu pārskatīšana | Dokumentu saturs paliek lokāls; validācijas pārbaudes var sazināties ar uzticamības pakalpojumiem |
| **Darbvirsmas lietotne** | Parakstīšana, viedkaršu darbplūsmas, regulāra lietošana | Nepieciešama | Parasti jā | Pilns darbplūsmas rīks | Lokāla vai hibrīda darbplūsma atkarībā no lietotnes un akreditācijas veida |
| **Oficiāls/pakalpojuma tīmekļa pakalpojums** | Pakalpojuma sniedzējam specifiskas parakstīšanas vai validācijas plūsmas | Nav | Bieži jā, bet atkarīgs no pakalpojuma | Pakalpojumam specifisks | Parasti servera puses, pāradresācijas vai pakalpojuma sniedzēja starpniecība |

## Būtiska piezīme

Rīka iespējas vairāk atkarīgas no jūsu parakstīšanas metodes un iestatījumiem:

- **Jūsu paraksta informācija** — viedkarte, eID, mobilais sertifikāts vai mākoņa parakstīšana
- **Pakalpojuma sniedzējs** — daži izmanto pārlūka pāradresācijas, daži API, daži paraksta servera pusē
- **Jūsu apjoms** — viena saņemta faila atvēršana vs. pilnas dokumentu darbplūsmas integrācija

## Kuru variantu izvēlēties?

### Vienkārši jāatver eDoc fails, ko kāds atsūtīja

Izmantojiet **pārlūka skatītāju**. Tas ir ātrākais variants, kad vēlaties apskatīt saturu, identificēt parakstītājus un lejupielādēt atsevišķus dokumentus no parakstītā faila.

### Jāparaksta dokumenti vai jāizmanto nacionālā eID darbplūsma

Izmantojiet **darbvirsmas parakstīšanas lietotni** vai **oficiālu/pakalpojuma tīmekļa pakalpojumu**. Pareizā izvēle ir atkarīga no tā, vai jūsu parakstīšanas metode ir kartes bāzēta, mobilās lietotnes bāzēta, mākoņa bāzēta vai saistīta ar konkrētu nacionālo vai pakalpojuma sniedzēja portālu.

### Nepieciešams oficiāls validācijas rezultāts

Izmantojiet **oficiālu/pakalpojuma tīmekļa pakalpojumu**. Ja valsts iestāde, uzticamības pakalpojuma sniedzējs vai biznesa process sagaida konkrētu validācijas rezultātu, izmantojiet šai darbplūsmai paredzēto validatoru vai portālu.

### Esmu uz darba datora, aizņemta datora vai tālruņa

Izmantojiet **pārlūka skatītāju**. Tas neprasa instalāciju un parasti ir vienkāršākais veids, kā atvērt saņemtu `.edoc`, `.asice` vai `.sce` failu.

### Strādāju ar lielu dokumentu skaitu vai regulāriem parakstīšanas uzdevumiem

Tas vairāk ir atkarīgs no **pakalpojuma sniedzēja un akreditācijas veida**, nevis no tīmekļa vs. darbvirsmas vien. Izmantojiet parakstīšanas platformu, integrācijas plūsmu vai dokumentu pārvaldības darbplūsmu, kas paredzēta šim iestatījumam.

## Kur iederas eDoc Viewer

eDoc Viewer ir labākais, kad vēlaties:

- Ātru piekļuvi jebkurā modernā pārlūkā — bez programmatūras instalēšanas vai atjaunināšanas
- Lokālu dokumentu satura apstrādi
- Ātru parakstu, sertifikātu un laika zīmogu apskatīšanu
- Vienkāršu veidu, kā atvērt `.edoc`, `.asice` un `.sce` failus

Ja tas atbilst jūsu vajadzībām, [atveriet savu failu skatītājā zemāk](#viewer).

eDoc Viewer nav pareizā izvēle, kad nepieciešams:

- Dokumentu parakstīšana
- Viedkaršu integrācija
- Pārbaudes rezultāti no oficiāla portāla vai iestādes
- Sistēma, kas pielāgota liela uzņēmuma darba plūsmai

## Oficiālu vai pakalpojumu sniedzēju tīmekļa rīku piemēri

- **[eParaksts (Latvija)](https://www.eparaksts.lv/lv/)**: izmantojiet, kad nepieciešamas Latvijas eDoc/ASiC-E parakstīšanas vai validācijas darbplūsmas, kas saistītas ar eParaksts ekosistēmu. Galvenā vietne tieši piedāvā parakstīšanas un validācijas plūsmas.
- **[Eiropas Komisijas DSS demonstrācijas tīmekļa lietotne](https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/validation)**: noderīga kā standartu orientēts testēšanas un izpētes rīks, bet Komisija skaidri norāda, ka tā ir demonstrācija un nav paredzēta kā ražošanas parakstu izveides vai validācijas pakalpojums.

## Saistītā informācija

- [Kā atvērt un pārbaudīt eDoc vai ASiC-E failu](/lv/atvert-edoc-failu)
- [Kas ir eDoc fails?](/lv/kas-ir-edoc)
- [ASiC-E failu lasītājs](/lv/asice-lasitajs)
