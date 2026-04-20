# ❤️U Festival 2026 — PWA

De officiële Progressive Web App voor het ❤️U Festival 2026, een tweedaags studentenfestival in Utrecht (15 & 16 augustus 2026, Grasweide Strijkviertel).

## Features

- **4 schermen**: Home (nieuws), Info (accordion), Schedule (blokkenschema), Map (Leaflet + GPS)
- **Tweetalig**: Nederlands / Engels met toggle
- **Dark/Light mode**: met system-preference detectie
- **PWA**: installeerbaar, offline bruikbaar via service worker (Workbox)
- **Favorieten**: sla favoriete acts op in localStorage
- **Notificaties**: Web Notifications API — herinnering 15/10/5 min voor aanvang
- **Interactieve kaart**: Leaflet.js met OpenStreetMap, GPS-locatie, podium-markers
- **Blokkenschema**: horizontaal + verticaal scrollbaar, dag-selector, favorietenfilter, act-detail modal met YouTube embed

## Tech Stack

- Vue 3 + Vite
- vue-router (client-side routing)
- vue-i18n (NL/EN)
- Leaflet.js (kaart)
- vite-plugin-pwa / Workbox (service worker + caching)
- Google Fonts (Sansation) + Material Icons
- Geen externe CSS frameworks — custom CSS met CSS custom properties

## Installeren & Lokaal draaien

```bash
# Clone de repository
git clone <repo-url>
cd "8.1 - Module - U Festival App - 2026"

# Installeer dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

## Builden voor productie

```bash
npm run build
npm run preview   # lokaal previewen van productie-build
```

De build output staat in `/dist`. Deploy deze map naar een webserver met HTTPS.

## Deployen

Upload de inhoud van `/dist` naar een HTTPS-hosting (bijv. Netlify, Vercel, GitHub Pages).

> **Belangrijk**: HTTPS is vereist voor Geolocation API en Push Notifications.

## Content updaten

Alle content staat in JSON-bestanden in `src/assets/data/`:

| Bestand         | Inhoud                          |
|----------------|---------------------------------|
| `news.json`    | Nieuwsberichten (Home)          |
| `info.json`    | Festival info (Info accordion)  |
| `schedule.json`| Programmering per dag/podium    |
| `acts.json`    | Artiest-details + YouTube links |
| `map.json`     | Kaart-instellingen + podia      |

Vertaling: elk bestand heeft `nl` en `en` secties (of `_nl`/`_en` velden).

## Projectstructuur

```
public/
  icons/          ← PWA iconen
  favicon.svg
  robots.txt
src/
  assets/data/    ← JSON content bestanden
  components/     ← AppHeader, BottomNav, ActModal
  composables/    ← useFavorites, useNotifications
  locales/        ← NL/EN i18n vertalingen
  views/          ← HomeView, InfoView, ScheduleView, MapView
  App.vue
  main.js
  router.js
  style.css       ← Globale CSS variabelen en reset
index.html
vite.config.js
```

---

*Opdracht 8.1 — Ridouan Rashid*
