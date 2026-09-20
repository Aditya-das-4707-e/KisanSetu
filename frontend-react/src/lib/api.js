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

export async function getCropPrice(cropId) {
  await delay();
  const price = MOCK_MARKET_PRICES[cropId];
  if (!price) return null;
  return { cropId, ...price };
}

export async function getAllPrices() {
  await delay();
  return MOCK_CROPS.map((c) => ({ crop: c, price: MOCK_MARKET_PRICES[c.id] })).filter(
    (p) => p.price
  );
}

export async function getPriceHistory(cropId, rangeDays = 30) {
  await delay(150);
  const full = MOCK_PRICE_HISTORY[cropId] || [];
  return full.slice(Math.max(0, full.length - rangeDays));
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
