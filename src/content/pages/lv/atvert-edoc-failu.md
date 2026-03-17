---
title: "Kā atvērt un pārbaudīt elektroniski parakstītu eDoc vai ASiC-E failu tiešsaistē"
description: "Uzziniet, kā atvērt un pārbaudīt .edoc, .asice un .sce failus tiešsaistē, apskatīt pielikumus un pārbaudīt elektroniskos parakstus savā pārlūkā."
locale: "lv"
pageType: "open-edoc-file"
defaultViewerLocale: "lv"
alternates:
  en: "/open-edoc-file"
  lv: "/lv/atvert-edoc-failu"
---

# Kā atvērt un pārbaudīt elektroniski parakstītu eDoc vai ASiC-E failu

**eDoc fails** ir ASiC-E konteinera formāts elektroniski parakstītiem dokumentiem. Ja saņēmāt `.edoc`, `.asice` vai `.sce` failu, varat to atvērt pārlūkā, apskatīt parakstīto saturu un pārskatīt parakstu informāciju, neinstalējot darbvirsmas programmatūru. Dokumentu saturs paliek jūsu pārlūkā uz jūsu ierīces un netiek augšupielādēts mūsu serveros.

## Īsumā

Ja jums tikai jāatver parakstīts fails un jāapskata saturs — [atveriet savu .edoc`, `.asice` vai `.sce` failu skatītājā](#viewer). Tas darbojas lokāli jūsu pārlūkā — jūsu faili paliek jūsu ierīcē. Ja jums jāizveido paraksti, izmantojiet darbvirsmas parakstīšanas lietotni vai citus oficiālus web bāzētus parakstīšanas rīkus. Ja nepieciešams pārliecināties par paraksta juridisko spēku — izmantojiet jūsu 
valsts oficiālo validācijas rīku.

## Soli pa solim: atveriet un pārbaudiet failu

1. **Ievelciet** savu `.edoc`, `.asice` vai `.sce` failu skatītājā
2. Fails tiks **atvērts lokāli jūsu pārlūkā** un saturs būs pieejams
3. **Apskatiet dokumentus** bez augšupielādes
4. **Pārbaudiet parakstus**, lai redzētu parakstītāja, paraksta un laika zīmoga informāciju
5. **Saglabājiet** atsevišķus failus, ja nepieciešams

Jūsu faili paliek jūsu ierīcē. Pilnai parakstu validācijai lietotne var sazināties ar parakstu informācijas un laika zīmogu pakalpojumu serveriem tiešsaistē.

## Ko var pārbaudīt

Pēc faila atvēršanas parasti varat:

- Redzēt visus parakstītos dokumentus
- Apskatīt parakstītāja identitāti un paraksta informāciju
- Pārbaudīt dokumenta integritāti (paraksta derīgumu, failu nemainīgumu) bez datu augšupielādes
- Pārskatīt laika zīmoga informāciju, ja tāda ir
- Saglabāt atsevišķus failus

## Atveriet eDoc failus zibenīgi (PWA)

Ja regulāri atverat `.edoc` vai `.asice` failus, instalējiet eDoc Viewer kā progresīvo tīmekļa lietotni visātrākajai dokumentu apskatei:

1. Atveriet eDoc Viewer pārlūkā Chrome
2. Noklikšķiniet uz instalēšanas ikonas adreses joslā (vai izvēlnē → "Instalēt eDoc Viewer")
3. Pēc instalēšanas Chrome var asociēt `.edoc`, `.asice` un `.sce` failus ar lietotni
4. Turpmāk **dubultklikšķiniet uz jebkura eDoc faila** un tas uzreiz atvērsies skatītājā

Tas ir vistuvākais vietējai darbvirsmas lietotnei bez instalēšanas — startējas uzreiz, darbojas bezsaistē un atver `.edoc`, `.asice` un `.sce` failus uzreiz no operētājsistēmas. Īpaši noderīgi, lai ātri priekšskatītu PDF un DOCX failus parakstītajos dokumentos.

## Kad izmantot citu rīku

Izmantojiet citu rīku, ja jūsu mērķis nav tikai faila atvēršana un apskatīšana:

- **Jāparaksta jauns dokuments** — izmantojiet darbvirsmas parakstīšanas lietotni
- **Nepieciešams oficiāls validācijas ieraksts** — izmantojiet vajadzībai atbilstošo oficiālo validatoru vai portālu
- **Nepieciešama integrācija ar jūsu dokumentu pārvaldības sistēmu?** [zenomy.tech](https://zenomy.tech/) veido pielāgotas eDoc/ASiC-E parakstīšanas un darbplūsmu integrācijas biznesa sistēmām.

Īsai salīdzināšanai skatiet [Salīdzināt eDoc skatītājus](/lv/salidzinat-skatitajus).

## Kas ir eDoc vai ASiC-E faila iekšienē?

eDoc faili izmanto **ASiC-E** (Associated Signature Container Extended) formātu — ZIP failu, kurā var būt:

- Oriģinālie dokumenti (PDF, DOCX, attēli u.c.)
- XML parakstu faili (signatures*.xml)
- Manifesta faili (META-INF/)

Mūsu skatītājs ļauj apskatīt šo saturu.

Ja vēlaties detalizētāku formāta skaidrojumu, skatiet [Kas ir eDoc fails? ASiC-E skaidrojums](/lv/kas-ir-edoc). Ja nepieciešams konteinera standarta skats, izmantojiet [ASiC-E lasītāja](/lv/asice-lasitajs) lapu.
