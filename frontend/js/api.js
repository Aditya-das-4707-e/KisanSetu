/* API layer — mock-backed. To connect Laravel later, replace each
   function body with a fetch() call returning the same shape.
   Example:
     // TODO(backend): return (await fetch(`/api/market-prices?crop=${cropName}`)).json();
*/
window.Api = (() => {
  const DB = () => window.MockDB;
  const delay = (v) => Promise.resolve(v); // keep async signature like fetch

  function norm(s) { return (s || "").trim().toLowerCase(); }

  /** GET /api/crops/search?q= — matches name, local name, aliases (alu -> Potato) */
  async function searchCrops(q) {
    // TODO(backend): return (await fetch('/api/crops/search?q=' + encodeURIComponent(q))).json();
    const nq = norm(q);
    if (!nq) return delay(DB().crops);
    return delay(DB().crops.filter(c =>
      norm(c.name).includes(nq) || norm(c.local).includes(nq) ||
      (c.aliases || []).some(a => norm(a).includes(nq) || nq.includes(norm(a)))
    ));
  }

  /** GET /api/market-prices — optional {crop, state, district} filter */
  async function getMarketPrices(filters = {}) {
    // TODO(backend): return (await fetch('/api/market-prices?' + new URLSearchParams(filters))).json();
    let rows = DB().marketPrices.slice();
    if (filters.crop) {
      const hit = await searchCrops(filters.crop);
      const names = new Set(hit.map(c => c.name));
      rows = rows.filter(r => names.has(r.crop));
    }
    if (filters.state) rows = rows.filter(r => norm(r.state) === norm(filters.state));
    if (filters.district) rows = rows.filter(r => norm(r.district) === norm(filters.district));
    return delay(rows);
  }

  /** GET /api/market-prices/history?crop=Tomato&range=30d */
  async function getPriceHistory(cropName, range = "30d") {
    // TODO(backend): return (await fetch(`/api/market-prices/history?crop=${cropName}&range=${range}`)).json();
    const all = DB().priceHistory[cropName] || [];
    const days = { "7d": 7, "30d": 30, "3m": 90, "6m": 180, "1y": 365 }[range] || 30;
    return delay(all.slice(-days));
  }

  /** GET /api/crops/:name snapshot: current, range, stats, trend */
  async function getCropPrice(cropName) {
    // TODO(backend): return (await fetch('/api/market-prices?crop=' + cropName)).json();
    const rows = await getMarketPrices({ crop: cropName });
    const row = rows[0];
    if (!row) return delay(null);
    const hist = await getPriceHistory(row.crop, "30d");
    const avgs = hist.map(h => h.avg);
    const avg = +(avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2);
    const sorted = avgs.slice().sort((a, b) => a - b);
    const q = (p) => sorted[Math.floor(p * (sorted.length - 1))];
    const trend = row.trend_pct >= 3 ? { dir: "up", label: "Rising" }
      : row.trend_pct <= -3 ? { dir: "down", label: "Falling" } : { dir: "flat", label: "Stable" };
    return delay({
      crop: row.crop, current_per_kg: row.per_kg,
      estimated_range: [+q(0.25).toFixed(2), +q(0.75).toFixed(2)],
      average: avg, lowest: Math.min(...avgs), highest: Math.max(...avgs),
      median: +sorted[Math.floor(sorted.length / 2)].toFixed(2),
      trend: { ...trend, pct: row.trend_pct },
      market: row.market, state: row.state, district: row.district,
      source: row.source, recorded_at: row.recorded_at, count: hist.length
    });
  }

  /** GET /api/nearby/farmers */
  async function getNearbyFarmers(crop, filters = {}) {
    // TODO(backend): return (await fetch('/api/nearby/farmers?...')).json();
    let rows = DB().farmers.filter(f => !crop || norm(f.crop) === norm(crop));
    if (filters.maxDistance) rows = rows.filter(f => f.distance_km <= +filters.maxDistance);
    if (filters.verifiedOnly) rows = rows.filter(f => f.verified);
    if (filters.maxPrice) rows = rows.filter(f => f.price_per_kg <= +filters.maxPrice);
    return delay(rows);
  }

  /** GET /api/nearby/buyers */
  async function getNearbyBuyers(crop, filters = {}) {
    // TODO(backend): return (await fetch('/api/nearby/buyers?...')).json();
    let rows = DB().buyers.filter(b => !crop || norm(b.crop) === norm(crop));
    if (filters.verifiedOnly) rows = rows.filter(b => b.verified);
    return delay(rows);
  }

  async function getAlerts() {
    // TODO(backend): return (await fetch('/api/alerts')).json();
    return delay(JSON.parse(localStorage.getItem("kisansetu_alerts") || "null") || DB().alerts);
  }
  async function createAlert(data) {
    // TODO(backend): return (await fetch('/api/alerts', {method:'POST', body: JSON.stringify(data)})).json();
    const list = await getAlerts();
    list.push({ id: Date.now(), active: true, ...data });
    localStorage.setItem("kisansetu_alerts", JSON.stringify(list));
    return delay(list);
  }
  async function deleteAlert(id) {
    // TODO(backend): await fetch('/api/alerts/' + id, {method:'DELETE'});
    const list = (await getAlerts()).filter(a => String(a.id) !== String(id));
    localStorage.setItem("kisansetu_alerts", JSON.stringify(list));
    return delay(list);
  }

  function toKg(qty, unit) {
    qty = parseFloat(qty) || 0;
    if (unit === "quintal") return qty * 100;
    if (unit === "tonne") return qty * 1000;
    return qty;
  }

  return { searchCrops, getMarketPrices, getPriceHistory, getCropPrice, getNearbyFarmers, getNearbyBuyers, getAlerts, createAlert, deleteAlert, toKg };
})();
