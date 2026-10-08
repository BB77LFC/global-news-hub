import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchLiveRssFeeds } from './src/server/feedFetcher.js';
import {
  trackEvent,
  verifyAdminPin,
  validateAdminToken,
  getAdminDashboardMetrics,
  resetAnalyticsData
} from './src/server/analyticsService.js';

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

        // Analytics tracking
        server.middlewares.use('/api/analytics/track', (req, res) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const result = trackEvent({
                ...data,
                ip: req.socket.remoteAddress || '127.0.0.1',
                userAgent: req.headers['user-agent'] || ''
              });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        });

        // Admin PIN login
        server.middlewares.use('/api/admin/login', (req, res) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const result = verifyAdminPin(data.pin, req.socket.remoteAddress || '127.0.0.1');
              res.setHeader('Content-Type', 'application/json');
              if (result.success) {
                res.end(JSON.stringify(result));
              } else {
                res.statusCode = 401;
                res.end(JSON.stringify(result));
              }
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        });

        // Admin Analytics Dashboard
        server.middlewares.use('/api/admin/analytics', (req, res) => {
          const url = new URL(req.url, 'http://localhost');
          const token = req.headers['x-admin-token'] || url.searchParams.get('token');
          if (!validateAdminToken(token)) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: 'Unauthorized: Invalid PIN token' }));
          }
          const metrics = getAdminDashboardMetrics();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            feedCount: devCache.length,
            totalSources: 26,
            ...metrics
          }));
        });

        // Admin Reset
        server.middlewares.use('/api/admin/reset', (req, res) => {
          const url = new URL(req.url, 'http://localhost');
          const token = req.headers['x-admin-token'] || url.searchParams.get('token');
          if (!validateAdminToken(token)) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
          }
          const result = resetAnalyticsData();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
