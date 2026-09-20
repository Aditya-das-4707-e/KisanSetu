# KisanSetu / Market Price Tracker — Frontend Only

> Know Your Market. Know Your Price.

Static, mobile-first frontend for an Indian agricultural market-price tracker.
**No backend, no database, no build step** — all data is local demo data,
clearly badged *"Showing sample/demo data"* on every page.

## Run

```bash
python3 -m http.server 8000 --directory frontend
# → http://localhost:8000/index.html
```

Or open `frontend/index.html` directly. Internet is needed for CDNs:
Bootstrap 5.3.3, Bootstrap Icons 1.11.3, Chart.js 4.4.1, Inter font.

## Pages (`frontend/`)

| Page | Purpose |
| ---- | ------- |
| `index.html` | Home: hero, crop search with autocomplete, location pill, quick actions, trending crops, how-it-works |
| `market.html` | All crops with price + trend; search, category filter, sort |
| `crop.html` | Crop detail: quantity calculator (kg/quintal/tonne), price range, stats, Chart.js history (7d–1y), farmer/buyer tables, price-alert modal |
| `farmers.html` / `buyers.html` | Nearby listings with filters (crop, distance, price, verified); approximate localities only |
| `dashboard-farmer.html` / `dashboard-buyer.html` | Role dashboards: crops/requirements (add–edit–remove), local prices, alerts, shortcuts |
| `alerts.html` | Create/pause/delete price alerts (above, below, % change) |
| `login.html` / `register.html` | Demo auth; register has Farmer/Buyer toggle, dependent State→District→City, inline validation |
| `profile.html` | Editable profile; role is read-only after verification |
| `404.html` | Not-found page |

## Assets

- `css/theme.css` — design tokens (brand green `#2E7D32`, Inter font, touch targets ≥ 44px)
- `css/style.css` — shared components (navbar, hero, cards, grids, forms, footer)
- `js/mock-data.js` — 19 crops, 5 markets, demo prices, 365-day history per crop, farmer/buyer listings, sample alerts, **19 states / 85 districts / 341 cities**
- `js/api.js` — backend-ready data layer (see below)
- `js/location.js` — browser Geolocation → demo locality, with manual State→District→City fallback
- `js/charts.js` — Chart.js price-history helper
- `js/validation.js` — form validation helpers with inline errors
- `js/main.js` — navbar, search autocomplete, trend badges, shared UI

## Connect a backend later

Edit **only** `frontend/js/api.js`. Every function (`searchCrops`,
`getMarketPrices`, `getPriceHistory`, `getCropPrice`, `getNearbyFarmers`,
`getNearbyBuyers`, `getAlerts`, `createAlert`, `deleteAlert`, `toKg`)
currently returns mock data and carries a `TODO(backend)` comment showing the
exact one-line `fetch()` replacement. UI code stays untouched.

Demo-only state lives in `localStorage` (`kisansetu_*` keys): fake login,
my crops/requirements, alerts, saved location.

## Notes

- Prices are **demo data, not live** — never present them as real market rates.
- Listings show approximate localities only; exact addresses are never exposed.
- Icons: Bootstrap Icons (SVG). No emojis in the UI.
