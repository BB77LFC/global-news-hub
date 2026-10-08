import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchLiveRssFeeds, FEED_SOURCES } from './src/server/feedFetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Cache to avoid hammering external RSS services
let cachedFeeds = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // refresh every 2 minutes

const getFeeds = async () => {
  if (Date.now() - lastFetchTime > CACHE_TTL_MS) {
    console.log('📡 Refreshing OmniPulse live feeds cache...');
    cachedFeeds = await fetchLiveRssFeeds();
    lastFetchTime = Date.now();
  }
  return cachedFeeds;
};

// Bootstrap cache on startup
getFeeds().catch(console.warn);

// ────────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────────

// All live feeds (with optional category / source / region filters)
app.get('/api/live-feeds', async (req, res) => {
  try {
    let feeds = await getFeeds();
    const { category, source, region, q, limit } = req.query;

    if (category && category !== 'All') {
      feeds = feeds.filter(f => f.category === category);
    }
    if (source && source !== 'All') {
      feeds = feeds.filter(f => f.sourceId === source.toLowerCase());
    }
    if (region && region !== 'All') {
      feeds = feeds.filter(f => !f.region || f.region === region || f.region === 'Global');
    }
    if (q) {
      const term = q.toLowerCase();
      feeds = feeds.filter(f =>
        f.title?.toLowerCase().includes(term) ||
        f.summary?.toLowerCase().includes(term)
      );
    }

    const maxItems = parseInt(limit) || 200;
    feeds = feeds.slice(0, maxItems);

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({
      success: true,
      count: feeds.length,
      totalSources: FEED_SOURCES.length,
      lastRefreshed: new Date(lastFetchTime).toISOString(),
      items: feeds
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trending — top 10 most recent from Tier-1 sources
app.get('/api/trending', async (req, res) => {
  try {
    const feeds = await getFeeds();
    const tier1 = feeds.filter(f => f.trustScore >= 95).slice(0, 12);
    res.json({ success: true, count: tier1.length, items: tier1 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Source catalogue
app.get('/api/sources', (req, res) => {
  const uniqueSources = FEED_SOURCES.map(s => ({
    id: s.sourceId,
    name: s.sourceName,
    category: s.category,
    region: s.region,
    tier: s.tier
  }));
  res.json({ success: true, count: uniqueSources.length, sources: uniqueSources });
});

// Force refresh the cache
app.post('/api/refresh', async (req, res) => {
  lastFetchTime = 0;
  const feeds = await getFeeds();
  res.json({ success: true, count: feeds.length, message: 'Live feed cache refreshed.' });
});

// Health / status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    wireStatus: 'active',
    cachedItems: cachedFeeds.length,
    lastRefreshed: lastFetchTime ? new Date(lastFetchTime).toISOString() : null,
    sourcesMonitored: FEED_SOURCES.length,
    timestamp: new Date().toISOString()
  });
});

// ────────────────────────────────────────────────
// Static SPA
// ────────────────────────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  📡 OmniPulse Global Intelligence Hub — LIVE     ║`);
  console.log(`║  🌐  http://localhost:${PORT}                       ║`);
  console.log(`║  ⚡  API: /api/live-feeds                         ║`);
  console.log(`║  🛰️   Sources: ${FEED_SOURCES.length} international news wires         ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);
});
