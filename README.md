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

Build / preview / deploy:

```bash
npm run build     # → dist/
npm run preview   # serve the production build locally
```

Deploys as a static Vite site (Vercel config in `frontend-react/vercel.json` keeps
`/api/market` on the serverless proxy and rewrites everything else to
`index.html`). Internet is needed for CDNs (Bootstrap Icons 1.11.3, Fraunces +
IBM Plex + Noto Sans Devanagari/Bengali fonts) and for the live price API.

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
| `/market` | All crops with **live** price + trend; search, state filter, sort |
| `/crop?crop=tomato` | Crop detail: quantity calculator (kg/quintal/tonne), price range, min/avg/max, Chart.js history (7d–1y), nearby-farmers table with filters, price-alert modal |
| `/farmers` | Nearby farmer listings with filters (crop, distance, price, verified); approximate localities only |

## Features

- **Live market prices** — `getCropPrice` / `getAllPrices` (`src/lib/api.js`) hit
  `GET /products/?name=&state=`; state filter comes from the saved location or the
  explicit `?state=` param ("" = All India). Crops with no live entry are hidden
  rather than showing a fake price.
- **Price history charts** — `getPriceHistory` rescales the stored 365-day curve to
  the live modal price and slices 7/30/90/180/365-day ranges (Chart.js line).
- **Price alerts** — rules created per crop (`above` / `below` / `percent_up` /
  `percent_down`); the Alerts page evaluates them against live prices and posts
  one news item per hit, expiring after 7 days.
- **Location flow** — browser geolocation → BigDataCloud / Nominatim reverse-geocode
  → `ipapi.co` IP fallback → manual State→District→Town picker with an
  **"Other town / village"** free-text fallback; saved to `localStorage`.
- **Language selector in the navbar** — English / हिन्दी / বাংলা. Translates the whole UI including crop, category and unit names (`src/lib/i18n.jsx`); choice persists in `localStorage`.

## Notes

- Live prices come from Agmarknet-backed data via the FastAPI service; when the API
  is unreachable (offline, cold start) affected crops show as unavailable instead of
  demo numbers.
- Farmer listings, alert defaults and location directory are still local demo data.
- Listings show approximate localities only; exact addresses are never exposed.
- Place names that really contain "Mandi" (e.g. Ramganj Mandi) are real locations, not branding.
