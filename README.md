# ❤️U Festival 2026 — PWA

De officiële Progressive Web App voor het ❤️U Festival 2026, een tweedaags studentenfestival in Utrecht (**5 & 6 augustus 2026**, Grasweide Strijkviertel).

## Features

- **4 schermen**: Home (nieuws + countdown), Info (accordion), Schedule (blokkenschema), Map (interactieve SVG-kaart)
- **Tweetalig**: Nederlands / Engels via toggle in de header
- **Dark/Light mode**: automatisch op basis van systeemvoorkeur, handmatig te wisselen
- **PWA**: installeerbaar op mobiel en desktop, offline bruikbaar via Workbox service worker
- **Favorieten**: sla favoriete acts op in localStorage, filter zichtbaar in de agenda
- **Notificaties**: Web Notifications API — herinnering 15/10/5 min voor aanvang van een act
- **Interactieve kaart**: custom SVG-kaart (90° gedraaid), pan/zoom/pinch, clickbare icoontjes met info-panel (acts per podium per dag), GPS-locatie chip alleen zichtbaar op festivalterrein
- **Agenda/blokkenschema**: horizontaal + verticaal scrollbaar, dag-selector, genrefilter als chips, favorietenfilter, act-detail modal met YouTube embed
- **PWA install-prompt**: "Installeer app" knop verschijnt automatisch als browser dit ondersteunt

## Tech Stack

- **Vue 3** + **Vite 7**
- **vue-router 5** (client-side routing, 4 routes)
- **vue-i18n 11** (NL/EN vertalingen via API of JSON-fallback)
- **vite-plugin-pwa / Workbox** (service worker, precaching, offline)
- **Geen kaartbibliotheek** — custom pan/zoom/pinch via raw DOM events op SVG-afbeelding
- **Google Fonts (Sansation)** + **Material Icons**
- **Geen externe CSS frameworks** — custom CSS met CSS custom properties (light/dark thema)
- **PHP API** (lokaal via XAMPP) + **JSON-fallback** (productie op Vercel)

## Vereisten

| Omgeving | Vereisten |
|----------|-----------|
| Lokaal   | Node.js ≥ 18, XAMPP (Apache + MySQL) |
| Productie | Vercel (statische hosting, geen PHP nodig) |

## Installeren & Lokaal draaien

```bash
# Clone de repository
git clone https://github.com/RidouanRashid/8.1---Module---U-Festival-App---2026.git
cd "8.1 - Module - U Festival App - 2026"

# Installeer dependencies
npm install

# Start development server (Vite)
npm run dev
# → http://localhost:5173
```

> **Lokale API (optioneel)**: Zet de map in `C:\xampp\htdocs\` en start Apache + MySQL in XAMPP.  
> Voer `scripts/setup_db.sql` uit in phpMyAdmin om de database aan te maken.  
> Zonder XAMPP werkt de app via de JSON-fallback in `public/data/`.

## Builden voor productie

```bash
npm run build        # output in /dist
npm run preview      # lokaal previewen van de productie-build
```

## Deployen op Vercel

De app is geconfigureerd voor Vercel via `vercel.json`. Alle routes vallen terug op `index.html` (SPA-routing). Data wordt geserveerd via statische JSON-bestanden in `public/data/`.

```bash
# Eenmalig koppelen
vercel link

# Deployen
vercel --prod
```

> **Belangrijk**: HTTPS is vereist voor de Geolocation API en Web Notifications.

## Content bijwerken

Statische data (Vercel / JSON-fallback) staat in `public/data/`:

| Bestand              | Inhoud                                      |
|----------------------|---------------------------------------------|
| `public/data/acts.json`     | Artiest-details (naam, genre, YouTube)      |
| `public/data/schedule.json` | Programmering per dag en podium             |
| `public/data/map.json`      | Kaartmarkers (podia + faciliteiten)         |
| `public/data/news.json`     | Nieuwsberichten (Home)                      |
| `public/data/info.json`     | Festival info (Info accordion)              |
| `public/data/locales.json`  | NL/EN vertalingen (UI-teksten)              |

Voor de lokale PHP/MySQL omgeving: pas `scripts/setup_db.sql` aan en herlaad de database.

## Projectstructuur

```
api/                  ← PHP endpoints (alleen lokaal/XAMPP)
  acts.php
  db.php
  info.php
  locales.php
  map.php
  news.php
  schedule.php
pictures/             ← SVG festivalkaart + marker-icoontjes
public/
  data/               ← JSON-fallback voor alle endpoints
  icons/              ← PWA iconen (192, 512, maskable)
  screenshots/        ← PWA install screenshots
  robots.txt
scripts/
  setup_db.sql        ← Database schema + seed data
src/
  assets/
    data/media.js     ← Afbeeldingenlijst (hero + galerij)
    images/           ← Afbeeldingen voor galerij
  components/
    ActModal.vue      ← Act-detail popup met YouTube embed
    AppHeader.vue     ← Header met thema/taal/install toggle
    BottomNav.vue     ← Navigatiebalk onderaan
  composables/
    useApi.js         ← Unified fetch: PHP-first, JSON-fallback
    useFavorites.js   ← Favorietenlijst (localStorage)
    useMapStore.js    ← Gedeelde kaart-state + markerposities
    useNotifications.js ← Web Notifications voor acts
  locales/
    index.js          ← vue-i18n setup
  map/
    iconRegistry.js   ← SVG-icoontjes per podium/faciliteit
  views/
    HomeView.vue      ← Home: hero, galerij, nieuws
    InfoView.vue      ← Info: accordion met festivalinfo
    ScheduleView.vue  ← Agenda: blokkenschema + filters
    MapView.vue       ← Kaart: SVG + pan/zoom/markers/GPS
  App.vue             ← Root layout, thema, taal, route-transitie
  main.js
  router.js
  style.css           ← Globale CSS custom properties (light/dark)
index.html
vite.config.js
vercel.json           ← Vercel SPA-routing configuratie
```

---

*Opdracht 8.1 — Ridouan Rashid*
