/* KisanSetu — API Layer (currently mock-backed).
   Every function returns a Promise like fetch(). Swap bodies for
   real Laravel endpoints later without touching callers. */
import {
  MOCK_CROPS,
  MOCK_MARKET_PRICES,
  MOCK_PRICE_HISTORY,
  MOCK_FARMERS,
  MOCK_ALERTS,
  setMockAlerts,
  LOCATIONS,
  DEMO_USER,
  DEMO_LOCATION,
} from "../data/mockData.js";

const ALERTS_KEY = "kisansetu_alerts";
const LOCATION_KEY = "kisansetu_location";

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* =====================================================================
   Live Market Price API — "Indian Market Price" (FastAPI)
   ---------------------------------------------------------------------
   The market pages are now backed by a real price service. Calls go to a
   same-origin route `/api/market` — proxied to the hosted FastAPI app by
   the Vite dev server (vite.config.js `server.proxy`) and, in production,
   by the Vercel function `api/market.js`. This avoids the Render API's
   CORS restrictions so the browser can read live data directly.

   The upstream base can still be overridden at build/dev time with the
   VITE_MARKET_API_BASE env var when you need to point elsewhere (e.g.
   http://127.0.0.1:8000 to hit a local backend).

   Every lookup is wrapped so that if the API is unreachable (offline,
   render cold-start, proxy down, 404 for a non-mandi crop) we transparently
   fall back to the demo MOCK data — the app never breaks and no page
   needs to know which source answered. Flip USE_LIVE_MARKET_API to
   false to force pure demo mode.
   ===================================================================== */
const MARKET_API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_MARKET_API_BASE) ||
  "/api/market";

const USE_LIVE_MARKET_API = true;
const MARKET_CACHE_TTL_MS = 10 * 60 * 1000; // client-side reuse window
const marketCache = new Map();

/** Current state (from the saved location), used for the live ?state= filter. */
function currentState() {
  try {
    const loc = JSON.parse(localStorage.getItem("kisansetu_location") || "null");
    return (loc && loc.state) || "";
  } catch {
    return "";
  }
}

function marketCacheKey(name, state, live) {
  return `${(name || "").trim().toLowerCase()}|${(state || "").trim().toLowerCase()}|${live ? 1 : 0}`;
}

function marketCacheGet(name, state, live) {
  const k = marketCacheKey(name, state, live);
  const hit = marketCache.get(k);
  if (hit && Date.now() - hit.t < MARKET_CACHE_TTL_MS) return hit.v;
  if (hit) marketCache.delete(k);
  return undefined;
}

function marketCacheSet(name, state, live, value) {
  marketCache.set(marketCacheKey(name, state, live), { t: Date.now(), v: value });
}

/**
 * GET /products/?name=… (+ optional state/live) and return the first
 * ProductPrice object, or null when nothing matches / call fails.
 */
async function fetchBackendPrice(name, { state = "", live = true } = {}) {
  if (!USE_LIVE_MARKET_API) return null;
  const cached = marketCacheGet(name, state, live);
  if (cached !== undefined) return cached;
  const params = new URLSearchParams({ name });
  if (state) params.set("state", state);
  if (!live) params.set("live", "false");
  let item = null;
  try {
    const res = await fetch(`${MARKET_API_BASE}/products/?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      item = Array.isArray(data) && data.length ? data[0] : null;
    }
  } catch {
    item = null; // offline / cold-start / CORS — caller falls back to mock
  }
  marketCacheSet(name, state, live, item);
  return item;
}

/** Live lookup that retries without the state filter if the state scope was empty. */
async function fetchBackendPriceBest(name, state) {
  if (!state) return fetchBackendPrice(name, { state: "" });
  const scoped = await fetchBackendPrice(name, { state });
  return scoped || fetchBackendPrice(name, { state: "" });
}

/** Map a backend ProductPrice onto the shape the existing pages already use. */
function liveToPrice(live, mock) {
  const modal = Number(live.market_price_per_kg);
  const unit = live.unit || "kg";
  return {
    min: live.min_price_per_kg != null ? Number(live.min_price_per_kg) : modal,
    max: live.max_price_per_kg != null ? Number(live.max_price_per_kg) : modal,
    modal,
    unit,
    market:
      live.matched_commodity
        ? `${live.matched_commodity} · Mandi`
        : mock ? mock.market : "Wholesale Mandi",
    state: mock ? mock.state : "",
    district: mock ? mock.district : "",
    source:
      live.source === "live"
        ? "Live · Agmarknet"
        : live.source === "cache"
          ? "Agmarknet · cached"
          : "Static",
    updatedMinsAgo: mock ? mock.updatedMinsAgo : 0,
    trendPct: mock ? mock.trendPct : 0,
    trendDir: mock ? mock.trendDir : "stable",
    live: true,
    arrivalDate: live.arrival_date,
    marketsCount: live.markets_count,
    matchedCommodity: live.matched_commodity,
  };
}

export async function getAllCrops() {
  await delay();
  return MOCK_CROPS;
}

export async function searchCrops(query) {
  await delay(80);
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  return MOCK_CROPS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.local.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.aliases || []).some((a) => a.includes(q) || q.includes(a))
  );
}

export async function getCropById(cropId) {
  await delay();
  return MOCK_CROPS.find((c) => c.id === cropId) || null;
}

export async function getCropPrice(cropId, state) {
  const crop = MOCK_CROPS.find((c) => c.id === cropId);
  if (USE_LIVE_MARKET_API && crop) {
    // Use the passed state as-is ("" = All India). Only fall back to the saved
    // location's state when no state was provided at all (undefined).
    const st = state !== undefined ? state : currentState();
    const live = await fetchBackendPriceBest(crop.name, st);
    // No hardcoded fallback: if the live API has no entry, report it as missing
    // rather than showing a fake demo price.
    if (live) return { cropId, ...liveToPrice(live, MOCK_MARKET_PRICES[cropId]) };
    return null;
  }
  await delay();
  const mock = MOCK_MARKET_PRICES[cropId];
  return mock ? { cropId, ...mock } : null;
}

export async function getAllPrices(state) {
  const st = state !== undefined ? state : currentState();
  if (USE_LIVE_MARKET_API) {
    const rows = await Promise.all(
      MOCK_CROPS.map(async (c) => {
        const mock = MOCK_MARKET_PRICES[c.id];
        const live = await fetchBackendPriceBest(c.name, st);
        return live ? { crop: c, price: liveToPrice(live, mock) } : null;
      })
    );
    return rows.filter((r) => r && r.price);
  }
  await delay();
  return MOCK_CROPS.map((c) => ({ crop: c, price: MOCK_MARKET_PRICES[c.id] })).filter(
    (p) => p.price
  );
}

export async function getPriceHistory(cropId, rangeDays = 30, state) {
  const full = MOCK_PRICE_HISTORY[cropId] || [];
  await delay(40);
  // Anchor the demo history to the current (possibly live) modal price so the
  // chart and the price card always tell the same story.
  const mockBase = MOCK_MARKET_PRICES[cropId]?.modal || 1;
  const live = await getCropPrice(cropId, state);
  const base = (live && live.modal) || mockBase;
  const ratio = base / mockBase;
  const scaled =
    ratio === 1 ? full : full.map((p) => ({ ...p, price: Math.round(p.price * ratio * 100) / 100 }));
  return scaled.slice(Math.max(0, scaled.length - rangeDays));
}

export async function getNearbyFarmers(cropId, filters = {}) {
  await delay(150);
  let list = MOCK_FARMERS.filter((f) => !cropId || f.crop === cropId);
  if (filters.maxDistance) list = list.filter((f) => f.distanceKm <= filters.maxDistance);
  if (filters.verifiedOnly) list = list.filter((f) => f.verified);
  if (filters.maxPrice) list = list.filter((f) => f.price <= filters.maxPrice);
  return list.sort((a, b) => a.distanceKm - b.distanceKm);
}

function persistAlerts(list) {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(list));
  } catch {
    /* private mode */
  }
}

function readStoredAlerts() {
  try {
    const saved = JSON.parse(localStorage.getItem(ALERTS_KEY) || "null");
    if (Array.isArray(saved)) setMockAlerts(saved);
  } catch {
    /* corrupted storage: keep defaults */
  }
}

export async function getAlerts() {
  await delay();
  readStoredAlerts();
  return MOCK_ALERTS;
}

export async function createAlert(data) {
  await delay(200);
  const alert = { id: Date.now(), active: true, ...data };
  const next = [alert, ...MOCK_ALERTS];
  setMockAlerts(next);
  persistAlerts(next);
  return alert;
}

export async function deleteAlert(id) {
  await delay(120);
  const next = MOCK_ALERTS.filter((a) => a.id !== id);
  setMockAlerts(next);
  persistAlerts(next);
  return { success: true };
}

export async function toggleAlert(id) {
  await delay(100);
  const next = MOCK_ALERTS.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
  setMockAlerts(next);
  persistAlerts(next);
  return next.find((a) => a.id === id);
}

export async function getLocations() {
  await delay(60);
  return LOCATIONS;
}

export async function detectLocation() {
  // Real browser geolocation + free reverse-geocoding (BigDataCloud, no key).
  // Throws a coded error so callers can explain the exact cause:
  // NO_API (needs HTTPS/localhost), DENIED (permission blocked),
  // UNAVAILABLE (no GPS fix and no network location either),
  // LOOKUP (GPS worked but place-name lookup failed — carries coords).
  let pos = null;
  try {
    pos = await new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        const e = new Error("geolocation-unavailable");
        e.code = "NO_API";
        reject(e);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        resolve,
        (err) => {
          const e = new Error("geolocation-failed");
          e.code = err && err.code === 1 ? "DENIED" : "UNAVAILABLE";
          reject(e);
        },
        {
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  } catch (err) {
    // Device can't get a GPS fix (typical Linux desktop): fall back to
    // network-based (IP) location instead of giving up.
    if (err && err.code === "UNAVAILABLE") return await ipFallbackLocation(err);
    throw err;
  }
  const { latitude, longitude } = pos.coords;
  // Place-name services, tried in order. If all fail, throw LOOKUP carrying
  // the raw coords so the caller can still save the real position.
  const services = [reverseBigDataCloud, reverseNominatim];
  for (const svc of services) {
    try {
      const loc = await svc(latitude, longitude);
      if (loc) return { ...loc, latitude, longitude };
    } catch {
      /* try next service */
    }
  }
  const e = new Error("reverse-geocode-failed");
  e.code = "LOOKUP";
  e.coords = { latitude, longitude };
  throw e;
}

async function fetchJson(url, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("bad-response");
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function reverseBigDataCloud(lat, lng) {
  const data = await fetchJson(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );
  const city = data.city || data.locality || "";
  const locality = data.locality || data.city || "";
  if (!city && !locality) throw new Error("empty-result");
  return {
    locality,
    district: city,
    state: data.principalSubdivision || "",
  };
}

async function reverseNominatim(lat, lng) {
  const data = await fetchJson(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en&zoom=14`
  );
  const a = data.address || {};
  const locality =
    a.suburb || a.neighbourhood || a.village || a.hamlet || a.town || a.city || "";
  const district = a.county || a.state_district || a.city_district || a.city || locality;
  const state = a.state || "";
  if (!locality && !district) throw new Error("empty-result");
  return { locality: locality || district, district: district || locality, state };
}

/** City-level location from the network connection (no GPS needed). */
async function ipFallbackLocation(originalError) {
  try {
    const data = await fetchJson("https://ipapi.co/json/");
    const city = data.city || "";
    if (!city) throw new Error("empty-result");
    return {
      locality: city,
      district: city,
      state: data.region || "",
      latitude: data.latitude,
      longitude: data.longitude,
      approximate: true,
    };
  } catch {
    throw originalError;
  }
}

export async function getCurrentUser(role) {
  await delay(80);
  return DEMO_USER[role] || DEMO_USER.farmer;
}

export function getSavedLocation() {
  try {
    return JSON.parse(localStorage.getItem(LOCATION_KEY) || "null") || DEMO_LOCATION;
  } catch {
    return DEMO_LOCATION;
  }
}

export function saveLocation(loc) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
  } catch {
    /* ignore */
  }
}

/* ---------------- Triggered alert news (auto-expires after 7 days) ---------------- */

const NEWS_KEY = "kisansetu_news";
const NEWS_SEED_KEY = "kisansetu_news_seeded";
export const NEWS_TTL_MS = 7 * 24 * 3600 * 1000;

function readNews() {
  try {
    const saved = JSON.parse(localStorage.getItem(NEWS_KEY) || "null");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeNews(list) {
  try {
    localStorage.setItem(NEWS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/** All live news items (anything older than 7 days is deleted first). Newest first. */
export async function getNotifications() {
  await delay();
  try {
    if (!localStorage.getItem(NEWS_SEED_KEY)) seedDemoNews();
  } catch {
    /* ignore */
  }
  const now = Date.now();
  const fresh = readNews()
    .filter((n) => now - (n.createdAt || 0) < NEWS_TTL_MS)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  writeNews(fresh);
  return fresh;
}

export async function addNotification(item) {
  await delay(80);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    ...item,
  };
  const next = [entry, ...readNews()];
  writeNews(next);
  return entry;
}

export async function deleteNotification(id) {
  await delay(80);
  writeNews(readNews().filter((n) => n.id !== id));
  return { success: true };
}

/** One-time demo news so the feed is alive on first run. Never re-seeds. */
function seedDemoNews() {
  const now = Date.now();
  const H = 3600 * 1000;
  const demo = [
    { id: `demo-${now}-1`, createdAt: now - 2 * H, ruleId: null, crop: "tomato", condition: "above", threshold: 30, unit: "kg", price: 32, changePct: null, location: "Kolkata" },
    { id: `demo-${now}-2`, createdAt: now - 26 * H, ruleId: null, crop: "onion", condition: "percent_up", threshold: 10, unit: "%", price: 34, changePct: 12.5, location: "Kolkata" },
    { id: `demo-${now}-3`, createdAt: now - 77 * H, ruleId: null, crop: "potato", condition: "below", threshold: 20, unit: "kg", price: 19, changePct: null, location: "Kolkata" },
    { id: `demo-${now}-4`, createdAt: now - 122 * H, ruleId: null, crop: "mango", condition: "above", threshold: 40, unit: "kg", price: 44, changePct: null, location: "Kolkata" },
  ];
  writeNews(demo);
  try {
    localStorage.setItem(NEWS_SEED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export { DEMO_LOCATION };
