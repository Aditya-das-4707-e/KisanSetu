# KisanSetu — React Frontend

React (Vite) port of `../frontend/` — same pages, same copy, same demo data, same
market-ledger styling. No details changed; only the implementation moved from static
HTML + imperative JS to React components + `react-router-dom`.

## Run

```bash
cd frontend-react
npm install
npm run dev     # → http://localhost:5173/
```

Internet is needed for CDNs (Bootstrap Icons, Google Fonts), same as the static build.

## Routes

| Route | Original page |
| ----- | ------------- |
| `/` | `index.html` — hero, search, trending, how-it-works |
| `/market` | `market.html` — filters + sort + crop grid |
| `/crop?crop=tomato` | `crop.html` — calculator, range, Chart.js history, listings, alert modal |
| `/farmers` | farmer listings |
| `/dashboard-farmer` | farmer dashboard |
| `/alerts` | `alerts.html` |
| `*` | `404.html` | (`/login`, `/register`, `/profile` redirect to `/` — auth removed) |

## Structure

- `src/css/` — `theme.css` + `style.css`, copied verbatim from the static site
- `src/data/mockData.js` — demo data, byte-for-byte the static `mock-data.js` + ESM exports
- `src/lib/api.js` — same Promise-based API as `js/api.js` (swap bodies for Laravel later)
- `src/lib/validation.js` — same rules/messages as `js/validation.js`
- `src/components/` — `Navbar`/`Footer`/`LocationModal` (from `js/main.js`), layout, chart, badges
- `src/pages/` — one component per page above

Notes: prices are demo data (badged in the navbar, as before); alert rules persist to
`localStorage` (`kisansetu_alerts`); triggered alert news lives under `kisansetu_news`
and auto-deletes after 7 days; location under `kisansetu_location`.

## Language

The navbar has a **Language** selector (English / हिन्दी / বাংলা). It translates the
entire UI — headings, buttons, labels, crop names, categories, units, and form
validation messages — via `src/lib/i18n.jsx`. The choice persists in `localStorage`
(`kisansetu_lang`). Noto Sans Devanagari + Noto Sans Bengali are loaded in
`index.html` so Hindi/Bengali text renders correctly.
