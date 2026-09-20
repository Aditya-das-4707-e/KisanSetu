# KisanSetu — Know Your Market. Know Your Price.

Mobile-first React (Vite) web app that shows **live Indian mandi crop prices**,
lets farmers browse nearby listings, track trends, and set price alerts.
**No login, no signup** — everything is open from the first visit.

## How it works

- **Live prices from API** — every price card calls the hosted
  *Indian Market Price* (FastAPI) backend at
  `https://farmer-api-ooi2.onrender.com` via the same-origin route
  `/api/market/products/?name=…&state=…`.
  Backend source code: **https://github.com/Aditya-das-4707-e/farmer_api** ·
  live root: `https://farmer-api-ooi2.onrender.com/` ·
  Swagger UI: `https://farmer-api-ooi2.onrender.com/docs`:
  - dev: Vite proxy in `frontend-react/vite.config.js` forwards `/api/market` → Render
    (avoids CORS).
  - prod (Vercel): serverless function `frontend-react/api/market.js` does the same
    forwarding with a short edge cache.
  - client caches lookups for 10 minutes (`src/lib/api.js`) and retries a
    state-scoped query without the state filter before giving up.
  - each card badges its source: **Live · Agmarknet**, **Agmarknet · cached**, or **Static**.
  - override the upstream with `VITE_MARKET_API_BASE` (e.g. `http://127.0.0.1:8000`
    for a local backend), or set `USE_LIVE_MARKET_API = false` in `src/lib/api.js`
    for pure offline demo mode.
- **Reference + demo data stays local** (`frontend-react/src/data/mockData.js`):
  19 crops with local names + search aliases (`alu` finds Potato),
  36 states/UTs, 787 districts, 4,100+ towns; demo farmer listings, default alert
  rules and 365-day price-history shapes. History curves are re-anchored to the
  live modal price so chart and price card always agree.
- **Everything else is client-side**: alert rules (`kisansetu_alerts`), triggered
  alert news with 7-day auto-expiry (`kisansetu_news`), saved location
  (`kisansetu_location`), language choice (`kisansetu_lang`).
- **No auth**: `/login`, `/register`, `/profile` redirect to `/`; the navbar
  "Dashboard" button opens `/dashboard-farmer` directly.

## Backend (price API)

Source: **https://github.com/Aditya-das-4707-e/farmer_api** — lightweight FastAPI
service (`main.py` + `gov_client.py` + `mapper.py` + `price_cache.py`, v4.0.0),
no database required, auto-deployed to Render at
`https://farmer-api-ooi2.onrender.com/` (Swagger UI at `/docs`).

- `GET /products/?name=<crop>` — plural-tolerant search over 411 curated products
  (cereals, pulses, vegetables, fruits, spices, dairy, honey, oils, …) with Hindi +
  Bengali names. Example: `GET /products/?name=rice`.
- `GET /products/?name=<crop>&state=<State>` — narrows the live average to one state.
- `GET /products/?name=<crop>&live=false` — forces the static fallback price.
- `GET /cache/stats`, `POST /cache/refresh` — 6-hour in-memory price cache controls.
- Live values = all-India Agmarknet modal average (via `data.gov.in` resource
  `9ef84268-d588-465a-a308-a864a43d0070`, Rs/quintal ÷ 100 → Rs/kg) with
  `source: live | cache`, `arrival_date`, `markets_count`, `min/max_price_per_kg`,
  `matched_commodity`; non-mandi goods (ghee, paneer, honey, milk, oils, pickles…)
  return `source: static_fallback`. Needs `DATA_GOV_IN_API_KEY` env for live —
  without it the API still works on static data (copy `.env.example` → `.env`;
  run locally with `uvicorn main:app --host 0.0.0.0 --port 8000`).
  Attribution: data by DMI via https://agmarknet.gov.in.

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
