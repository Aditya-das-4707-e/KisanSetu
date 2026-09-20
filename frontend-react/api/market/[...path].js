// Vercel serverless function — same-origin proxy for the live Indian Market
// Price (FastAPI) service. The React app calls `/api/market/products/…` and
// this function forwards to Render, which removes the browser CORS restriction.
//
// This is a catch-all route (`api/market/[...path].js`) so that every subpath
// under `/api/market/` reaches this handler. (A plain `api/market.js` would
// only match the exact path `/api/market`, and subpath calls would fall
// through to the SPA rewrite and come back as index.html.)
//
// The SPA rewrite in vercel.json (`/((?!api/).*)` → `/index.html`) explicitly
// excludes `/api/*`, so this function takes precedence for `/api/market`.

const UPSTREAM = "https://farmer-api-ooi2.onrender.com";

export default async function handler(req, res) {
  // req.url is the full original path, e.g.
  // `/api/market/products/?name=potato&state=West+Bengal`.
  // Strip the `/api/market` prefix (tolerating a missing trailing path) and
  // forward the remainder — including the query string — to Render.
  let subPath = "/";
  try {
    const u = new URL(req.url || "/", "http://localhost");
    subPath = u.pathname.replace(/^\/api\/market/, "") || "/";
    subPath += u.search || "";
  } catch {
    subPath = (req.url || "/").replace(/^\/api\/market/, "") || "/";
  }
  const target = UPSTREAM + subPath;

  // Bound the wait: Render free-tier cold starts can take a while, but we
  // must answer before Vercel's function timeout so the client can fall back.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);

  try {
    const up = await fetch(target, {
      headers: { accept: "application/json" },
      signal: ctrl.signal,
    });
    // Pass the upstream status through: 404 (unknown crop) stays 404 so the
    // client hides just that crop; only unreachable-upstream becomes a 502
    // so the client knows it may fall back to demo data.
    const body = await up.text();
    res.statusCode = up.status;
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "public, max-age=60, s-maxage=300");
    res.end(body);
  } catch {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ detail: "Market price API upstream unreachable" }));
  } finally {
    clearTimeout(timer);
  }
}
