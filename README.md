# KisanSetu / Market Price Tracker — Frontend Only

> Know your market. Know your price.

React (Vite), mobile-first frontend for an Indian agricultural market-price tracker.
**No backend, no database** — all data is local demo data,
clearly badged *"Showing sample / demo data"* in the navbar on every page.

## Run

```bash
cd frontend-react
npm install
npm run dev
# → http://localhost:5173/
```

Internet is needed for CDNs:
Bootstrap Icons 1.11.3, Fraunces + IBM Plex + Noto Sans Devanagari/Bengali fonts.
See `frontend-react/README.md` for routes and project structure.

## Design

Market-ledger aesthetic, hand-rolled CSS (no UI framework):
forest green + mustard accents on warm paper, Fraunces serif headlines,
IBM Plex Sans body, tabular mono numerals like a real mandi price board.
Shared navbar/footer/location modal live in `frontend-react/src/components/`.
Icons are Bootstrap Icons (SVG) — no emojis in the UI.

## Pages (`frontend-react/src/pages/`)

| Route | Purpose |
| ----- | ------- |
| `/` | Home: hero, crop search with autocomplete, location flow, quick actions, trending crops, how-it-works |
| `/market` | All crops with price + trend; search, category filter, sort |
| `/crop?crop=tomato` | Crop detail: quantity calculator (kg/quintal/tonne), price range, min/avg/max, Chart.js history (7d–1y), nearby-farmers table with filters, price-alert modal |
| `/farmers` | Nearby farmer listings with filters (crop, distance, price, verified); approximate localities only |
| `/dashboard-farmer` | Farmer dashboard: crops (add–remove), local prices, alerts, shortcuts |
| `/alerts` | Price alerts news feed (demo items included; auto-deletes after 7 days); rules are created from any crop page |
| `/profile` | Editable profile; role is read-only after verification |
| `*` | Not-found page |

## Features

- **Language selector in the navbar** — English / हिन्दी / বাংলা. Translates the whole UI including crop, category and unit names (`src/lib/i18n.jsx`); choice persists in `localStorage`
- **Data layer** (`src/data/mockData.js` + `src/lib/api.js`) — 19 crops (with local names + search aliases, so `alu` finds Potato), per-crop price snapshots, generated 365-day history, farmer listings, sample alerts, **36 states/UTs, 787 districts, 4,100+ towns**. Any village not listed can be typed via the **"Other town / village"** fallback in every location selector. Every API function returns a Promise like `fetch()`; swap bodies for real Laravel endpoints later without touching callers. Alerts persist to `localStorage` (`kisansetu_alerts`); saved location under `kisansetu_location`

## Notes

- Prices are **demo data, not live** — never present them as real market rates.
- Listings show approximate localities only; exact addresses are never exposed.
- Place names that really contain "Mandi" (e.g. Ramganj Mandi) are real locations, not branding.
