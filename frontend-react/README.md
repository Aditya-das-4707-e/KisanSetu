# KisanSetu — React Frontend (live API, no login)

React 19 + Vite + `react-router-dom` app. **All pages are open — no login, no
signup.** Market prices come from the live *Indian Market Price* (FastAPI)
backend — source code at **https://github.com/Aditya-das-4707-e/farmer_api**,
hosted at `https://farmer-api-ooi2.onrender.com`
(Swagger UI at `https://farmer-api-ooi2.onrender.com/docs`); everything else
(alerts, location, language) is client-side `localStorage`.

## Run

```bash
cd frontend-react
npm install
npm run dev     # → http://localhost:5173/
npm run build   # → dist/
npm run preview # serve the production build locally
```

Internet is needed for CDNs (Bootstrap Icons 1.11.3, Google Fonts) **and** for
the live price API (see below).

## Routes

| Route | Page |
| ----- | ---- |
| `/` | Home — hero, crop search with autocomplete, location flow, quick actions, trending crops, how-it-works |
| `/market` | Market grid — **live** prices, search + state filter + sort |
| `/crop?crop=tomato` | Crop detail — quantity calculator (kg/quintal/tonne), min/avg/max range, Chart.js history (7d–1y), nearby sellers, price-alert modal |
| `/farmers` | Nearby farmer listings with filters (crop, distance, price, verified) |
| `/dashboard-farmer` | Farmer dashboard — crops (add–remove), live local prices, alerts, shortcuts |
| `/alerts` | Price alerts — your rules + triggered news feed (news auto-deletes after 7 days) |
| `*` | 404 page (`/login`, `/register`, `/profile` redirect to `/` — auth was removed) |

## Data: what is live vs local

**Live (FastAPI backend):**

- `getCropPrice(cropId, state)` / `getAllPrices(state)` in `src/lib/api.js` call
  `GET /api/market/products/?name=<Crop>&state=<State>` and map the response
  (`market_price_per_kg`, `min/max_price_per_kg`, `matched_commodity`,
  `arrival_date`, `markets_count`, `source: live|cache|static`) onto the price
  cards. Source is badged per card: **Live · Agmarknet / Agmarknet · cached /
  Static**. Crops with no live entry are hidden — never a fake price.
- State filter: explicit `?state=` param wins (`""` = All India); otherwise the
  saved location's state; retries state-scoped query without the state before
  giving up. Same-origin `/api/market` avoids CORS:
  - dev → Vite proxy (`vite.config.js` `server.proxy`) → `MARKET_API_TARGET`
    (`https://farmer-api-ooi2.onrender.com`).
  - prod (Vercel) → serverless `api/market.js` → same upstream (edge cache
    `max-age=60, s-maxage=300`).
  - override: `VITE_MARKET_API_BASE` env (e.g. `http://127.0.0.1:8000`); hard
    offline switch: `USE_LIVE_MARKET_API = false` in `src/lib/api.js`.
  - client caches lookups 10 min (`MARKET_CACHE_TTL_MS`).
- `getPriceHistory(cropId, days, state)` re-anchors the stored 365-day curve to
  the **live** modal price so the chart and the price card always match.

## Backend repo

**https://github.com/Aditya-das-4707-e/farmer_api** — the FastAPI price service
this app reads (`main.py`, `gov_client.py`, `mapper.py`, `price_cache.py`,
`requirements.txt`; v4.0.0, no DB, auto-deploys to Render):

| Endpoint | Use |
| -------- | --- |
| `GET /products/?name=<crop>` | Plural-tolerant search over 411 products (e.g. `?name=rice`), Hindi + Bengali names included |
| `GET /products/?name=<crop>&state=<State>` | State-scoped live Agmarknet average |
| `GET /products/?name=<crop>&live=false` | Force static fallback price |
| `GET /cache/stats` / `POST /cache/refresh` | Inspect / refresh the 6h in-memory cache |

Live = all-India Agmarknet modal average via `data.gov.in` (resource
`9ef84268-d588-465a-a308-a864a43d0070`), converted Rs/quintal → Rs/kg with
`arrival_date`, `markets_count`, min/max and `matched_commodity`; non-mandi
goods (ghee, paneer, honey, milk, oils, pickles…) return
`source: static_fallback`. Requires `DATA_GOV_IN_API_KEY` for live data
(copy `.env.example` → `.env`); without a key it serves static prices.
Run locally: `uvicorn main:app --host 0.0.0.0 --port 8000`.

**Local (`src/data/mockData.js` + `localStorage`):**

- Crop directory (19 crops, local names + aliases), 36 states/UTs → 787
  districts → 4,100+ towns, demo farmer listings, default alert rules,
  price-history shapes.
- `localStorage`: alert rules (`kisansetu_alerts`), triggered news
  (`kisansetu_news`, 7-day TTL), saved location (`kisansetu_location`),
  language (`kisansetu_lang`).
- Location flow: browser geolocation → BigDataCloud / Nominatim reverse-geocode
  → `ipapi.co` IP fallback → manual State→District→Town picker with an
  **"Other town / village"** free-text fallback.

## Structure

- `src/App.jsx` — router (`BrowserRouter`, `Layout` outlet, redirects for removed auth routes)
- `src/components/` — `chrome.jsx` (`Navbar`/`Footer`/`LocationModal`), `Layout.jsx`,
  `LocationSelects.jsx`, `PriceChart.jsx` (Chart.js line), `bits.jsx` (trend icon, verified badge)
- `src/pages/` — `Home`, `Market`, `CropDetail`, `Farmers`, `DashboardFarmer`, `Alerts`, `NotFound`
- `src/lib/api.js` — data layer (live market API + local mock fallbacks/reference data)
- `src/lib/i18n.jsx` — EN/HI/BN dictionaries, crop/category/unit translators, `LanguageProvider`, `validators()`
- `src/lib/validation.js` — `validateValues(values, { field: [rules] })` runner
- `src/css/` — `theme.css` (design tokens) + `style.css` (market-ledger theme)
- `api/market.js` + `vite.config.js` + `vercel.json` — same-origin API proxy + SPA rewrites

## Language

The navbar has a **Language** selector (English / हिन्दी / বাংলা). It translates the
entire UI — headings, buttons, labels, crop names, categories, units, and form
validation messages — via `src/lib/i18n.jsx`. The choice persists in `localStorage`
(`kisansetu_lang`). Noto Sans Devanagari + Noto Sans Bengali are loaded in
`index.html` so Hindi/Bengali text renders correctly.
