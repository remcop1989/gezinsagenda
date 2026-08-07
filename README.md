# 📅 Gezinsagenda

Een lichte, installeerbare webapp (PWA) waarmee een gezin samen één agenda, kindweergave en lijstjes bijhoudt — gesynchroniseerd via een gedeelde "gezinscode", zonder account of inlogscherm.

## Functionaliteiten

- **Agenda** — maand-, week- en dagweergave, afspraken toevoegen/bewerken, filteren per gezinslid
- **Kindweergave** — vereenvoudigd overzicht per kind (week/dag)
- **Lijstjes** — gedeelde to-do/boodschappenlijsten
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

## Deployen
De app is statisch (geen server-side code nodig) en kan direct gehost worden op bijvoorbeeld:
- Firebase Hosting
- GitHub Pages
- Netlify / Vercel

## Bekende beperkingen
- Meldingen werken alleen lokaal en alleen als de app recent geopend is geweest — geen gegarandeerde achtergrond-push.
- De gezinscode is geen echte authenticatie, maar werkt als gedeeld wachtwoord — beveilig dit vooral via Firestore-rules.
