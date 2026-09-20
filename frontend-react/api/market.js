// Vercel serverless function — same-origin proxy for the live Indian Market
// Price (FastAPI) service. The React app calls `/api/market/products/…` and
// this function forwards to Render, which removes the browser CORS restriction.
//
// Vercel auto-deploys anything under `api/` as serverless functions. The
// catch-all rewrite in vercel.json (`/(.*)` → `/index.html`) is only applied
// to non-`/api/*` paths, so this function takes precedence for `/api/market`.

const UPSTREAM = "https://farmer-api-ooi2.onrender.com";

export default async function handler(req, res) {
  // req.url is `/api/market/products/?name=potato&state=West+Bengal`
  const path = (req.url || req.pathname || "/").replace(/^\/api\/market/, "") || "/";
  const target = UPSTREAM + path;

  try {
    const up = await fetch(target, {
      headers: { accept: "application/json" },
    });
    const body = await up.text();
    res.statusCode = up.status;
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "public, max-age=60, s-maxage=300");
    res.end(body);
  } catch {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ detail: "Market price API upstream unreachable" }));
  }
}