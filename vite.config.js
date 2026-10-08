import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchLiveRssFeeds } from './src/server/feedFetcher.js';

// In-process cache for dev server
let devCache = [];
let devCacheTime = 0;
const DEV_CACHE_TTL = 90 * 1000; // 90 seconds in dev

const getLiveFeeds = async () => {
  if (Date.now() - devCacheTime > DEV_CACHE_TTL) {
    devCache = await fetchLiveRssFeeds();
    devCacheTime = Date.now();
  }
  return devCache;
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'omnipulse-live-api',
      configureServer(server) {
        // Live feeds endpoint (with optional query params)
        server.middlewares.use('/api/live-feeds', async (req, res) => {
          try {
            let items = await getLiveFeeds();
            const url = new URL(req.url, 'http://localhost');
            const category = url.searchParams.get('category');
            const source = url.searchParams.get('source');
            const q = url.searchParams.get('q');

            if (category && category !== 'All') {
              items = items.filter(i => i.category === category);
            }
            if (source && source !== 'All') {
              items = items.filter(i => i.sourceId === source.toLowerCase());
            }
            if (q) {
              const term = q.toLowerCase();
              items = items.filter(i => i.title?.toLowerCase().includes(term) || i.summary?.toLowerCase().includes(term));
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              success: true,
              count: items.length,
              lastRefreshed: new Date(devCacheTime).toISOString(),
              items
            }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/refresh', async (req, res) => {
          devCacheTime = 0;
          const items = await getLiveFeeds();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, count: items.length }));
        });

        server.middlewares.use('/api/health', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'dev-operational',
            cachedItems: devCache.length,
            lastRefreshed: devCacheTime ? new Date(devCacheTime).toISOString() : null,
            timestamp: new Date().toISOString()
          }));
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
