# 📅 Gezinsagenda

Een lichte, installeerbare webapp (PWA) waarmee een gezin samen één agenda, kindweergave en lijstjes bijhoudt — gesynchroniseerd via een gedeelde "gezinscode", zonder account of inlogscherm.

## Functionaliteiten

- **Agenda** — maand-, week- en dagweergave, afspraken toevoegen/bewerken, filteren per gezinslid; bij herhalende afspraken kun je kiezen of een wijziging/verwijdering alleen dat ene exemplaar, dit + alle volgende, of de hele reeks raakt
- **Kindweergave** — vereenvoudigd overzicht per kind (week/dag)
- **Lijstjes** — gedeelde lijstjes in 3 types (afvinklijst, genummerde lijst, opsomming); items zijn te bewerken, te herordenen (▲/▼) en te verwijderen, met een knop om een hele lijst in één keer leeg te maken
- **Gezinsleden beheren** — leden toevoegen, iemand markeren als "kind"
- **Meldingen** — lokale melding ~15 min voor een afspraak (geen achtergrond-push)
- **Export/import** — back-up van alle gegevens als `.json`
- **Offline-ondersteuning** — werkt als PWA met een service worker, installeerbaar op beginscherm
- **Realtime sync** — via Firebase Firestore; elk apparaat met dezelfde gezinscode ziet dezelfde data

## Techstack

- Vanilla HTML, CSS en JavaScript (geen framework, geen build-stap)
- [Firebase](https://firebase.google.com/) (Firestore voor data, App Check met reCAPTCHA v3)
- Service worker voor offline-gebruik en caching

## Projectstructuur

```
├── index.html          # Structuur van de app (agenda, kindweergave, lijsten, instellingen)
├── styles.css           # Styling
├── app.js                # Applicatielogica (UI, interacties, rendering)
├── firebase-config.js     # Firebase-projectconfiguratie (API-sleutels)
├── firebase-sync.js       # Synclaag tussen de app en Firestore
├── firestore.rules.txt    # Firestore security rules (ter documentatie/versiebeheer — leidend is wat in de Firebase Console staat; .txt zodat het ook als Claude-projectkennis te uploaden is)
└── sw.js                    # Service worker (offline-caching, meldingsclicks)
```

## Aan de slag

### 1. Firebase-project opzetten
1. Maak een gratis project aan in de [Firebase Console](https://console.firebase.google.com/).
2. Voeg een webapp toe (Projectinstellingen → Algemeen → Jouw apps) en kopieer de configuratiegegevens.
3. Vul deze in `firebase-config.js` in bij `firebaseConfig`.
4. Zet **Firestore Database** aan (in test- of productiemodus, met passende [security rules](https://firebase.google.com/docs/firestore/security/get-started)).
5. (Optioneel maar aanbevolen) Zet **App Check** aan met reCAPTCHA v3 en vul de publieke site key in bij `recaptchaSiteKey`.

> ⚠️ `firebase-config.js` bevat projectgegevens die met de app worden meegestuurd naar de browser. Bescherm je data met goede Firestore security rules — niet door de config geheim te houden.

#### Let op bij het schrijven van security rules
`request.resource` (de binnenkomende data van een schrijfactie) is niet bij elke operatie beschikbaar. Dat heeft al twee keer voor een sluipende bug gezorgd, dus splits regels altijd expliciet op:
- **Niet** `read` en `write` in één blok combineren — bij een `read` bestaat `request.resource` niet, dus elke voorwaarde die daarop steunt laat ook het lézen mislukken.
- **Niet** `create`/`update` en `delete` onder één `allow write` zetten — bij een `delete` stuurt de client geen `request.resource.data` mee. Een voorwaarde als `request.resource.data.size() < 30` faalt dan altijd, waardoor verwijderen nooit lukt (en er zonder foutafhandeling in de app niets op wijst — de wijziging lijkt gewoon "vanzelf" terug te komen).

Gebruik dus losse blokken: `allow read`, `allow create, update` (met de datavalidatie erin) en `allow delete` (zonder afhankelijkheid van `request.resource`).

#### Hoe Firestore de datastructuur aanmaakt
Firestore is een schemaloze (NoSQL document-)database: er hoeven van tevoren geen tabellen, kolommen of rijen te worden gedefinieerd in de Firebase Console. `firebase-sync.js` schrijft data naar paden als `households/{gezinscode}/events/{eventId}`; zodra de app voor het eerst iets naar zo'n pad schrijft, maakt Firestore die collectie en dat document vanzelf aan. De security rules bepalen alleen wíe mag lezen/schrijven, niet hoe de data eruitziet — dat betekent ook dat elke nieuwe, unieke gezinscode automatisch zijn eigen, gescheiden datapad krijgt zonder enige configuratie.

### 2. Lokaal draaien
Omdat de app JavaScript-modules (`type="module"`) gebruikt, moet je hem via een lokale webserver openen (niet direct als `file://`), bijvoorbeeld:

```bash
# met Python
python3 -m http.server 8000

# of met Node
npx serve .
```

Open daarna `http://localhost:8000`.

### 3. Gebruiken
Bij de eerste keer openen vraagt de app om een **gezinscode** te verzinnen (werkt als wachtwoord). Iedereen die dezelfde code invoert op zijn eigen apparaat ziet en bewerkt dezelfde agenda.

### 4. Meerdere gezinnen / testers
Er is geen aparte "gezin aanmaken"-functie nodig. De gezinscode is direct het scheidingscriterium: elke unieke code krijgt automatisch zijn eigen, volledig gescheiden pad in Firestore, zonder dat daar in de Firebase Console iets voor hoeft te worden opgezet (zie ["Hoe Firestore de datastructuur aanmaakt"](#hoe-firestore-de-datastructuur-aanmaakt) hieronder).

Wil een ander gezin de app los uitproberen?
1. Laat diegene de app openen op een eigen apparaat (of, op een gedeeld apparaat, eerst via **Instellingen → Wissel van gezinscode** uitloggen bij het huidige gezin).
2. Laat diegene bij het welkomstscherm een **eigen, unieke** gezinscode verzinnen (niet dezelfde als een ander test-gezin).
3. Klaar — dat gezin heeft nu zijn eigen agenda, geheel los van de rest.

Dit wordt ook kort toegelicht op het welkomstscherm zelf.

**Gezinscode kwijt?** Er is geen "wachtwoord vergeten"-functie (er is geen account of e-mailadres), maar zolang minstens één apparaat van dat gezin nog is ingelogd, staat de huidige code zichtbaar in **Instellingen → Gezinscode & back-up**. Is echt niemand meer ingelogd, dan is de data alleen nog terug te halen via een eerder gemaakte export (`.json`-back-up) — anders is hij niet meer toegankelijk via de app.

## Deployen
De app is statisch (geen server-side code nodig) en kan direct gehost worden op bijvoorbeeld:
- Firebase Hosting
- GitHub Pages
- Netlify / Vercel

## Bekende beperkingen
- Meldingen werken alleen lokaal en alleen als de app recent geopend is geweest — geen gegarandeerde achtergrond-push.
- De gezinscode is geen echte authenticatie, maar werkt als gedeeld wachtwoord — beveilig dit vooral via Firestore-rules.
- Er is geen "wachtwoord vergeten"-functie voor de gezinscode. Zolang minstens één apparaat nog is ingelogd staat de code in Instellingen; is niemand meer ingelogd, dan is de data alleen terug te halen via een eerder gemaakte export.
