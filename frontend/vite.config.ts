import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Emit pre-compressed .br and .gz next to each asset at build time.
    // CI force-commits frontend/dist/ to main, so these ship to every
    // deployment (incl. no-nginx laptop installs) without a Node step.
    // blueprints/react_app.py serves them when the client advertises the
    // encoding, falling back to the raw asset otherwise. Zero per-request
    // CPU; nginx passes Content-Encoding through without double-compressing.
    compression({ algorithms: ['brotliCompress', 'gzip'], exclude: [/\.(br|gz)$/], threshold: 1024 }),
  ],
  // plotly.js-dist-min's UMD wrapper has an unguarded `global.matchMedia`
  // reference. Vite 8 no longer shims Node's `global` in the browser, so the
  // /tools pages that load Plotly (StrategyBuilder, MaxPain, OI Tracker, etc.)
  // threw "global is not defined". Map `global` to the browser `globalThis`.
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Specific rules first (order matters — first match wins)
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
        changeOrigin: true,
      },
      // Forward every Flask blueprint route to the backend.
      // Vite serves /@vite, /@react-refresh, /src, /node_modules itself;
      // everything else (auth, login, sandbox, broker, api …) goes to Flask.
      '/auth': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/login': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/broker': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/dashboard': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/sandbox': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/leverage': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/orderbook': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/tradebook': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/positions': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/holdings': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/strategy': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/python': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/chartink': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/admin': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/telegram': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/whatsapp': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/logs': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/profile': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/apikey': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/master-contract': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/action-center': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/platforms': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/tradingview': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/gocharting': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/pnl-tracker': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/historify': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/search': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/tools': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/scalping': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/optionchain': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/ivchart': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/oitracker': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/maxpain': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/straddle': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/straddlepnl': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/volsurface': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/gex': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/ivsmile': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/oiprofile': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/strategybuilder': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/websocket': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/flow': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/playground': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/faq': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/setup': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/download': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/error': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/rate-limited': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Plotly core can legitimately produce a large shared chart chunk.
    // Keep the limit high enough for that known vendor cost while still
    // flagging any new app-code chunk that drifts above 1MB.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // Split the stable framework libs into their own long-cached chunk
        // so an app-code change doesn't bust react/router/query for returning
        // users, and the browser can fetch vendor + page chunks in parallel.
        // Vite already splits the heavy charting libs (plotly, lightweight-
        // charts) automatically, so we only carve out the framework core here.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor'
          }
          if (id.includes('tanstack/react-query')) return 'tanstack'
        },
      },
    },
  },
})
