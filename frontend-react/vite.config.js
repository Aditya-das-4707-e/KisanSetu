import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// API base for the live Indian Market Price (FastAPI) service. Local/dev traffic
// is proxied through this same-origin route (see `server.proxy`) so we never hit
// the Render API's CORS restrictions. Production (Vercel) uses `api/market.js`.
const MARKET_API_TARGET = 'https://farmer-api-ooi2.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/market': {
        target: MARKET_API_TARGET,
        changeOrigin: true,
        // Strip the `/api/market` prefix before forwarding to Render.
        rewrite: (path) => path.replace(/^\/api\/market/, ''),
      },
    },
  },
})
