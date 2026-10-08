import crypto from 'crypto';

// ── In-Memory Analytics Store ─────────────────────────────────────
const analyticsState = {
  startedAt: new Date().toISOString(),
  totalPageviews: 0,
  uniqueVisitorHashes: new Set(),
  activeSessions: new Map(), // hash -> lastSeenTimestamp
  referrers: {},            // referrer -> count
  devices: { desktop: 0, mobile: 0, tablet: 0 },
  browsers: {},             // browserName -> count
  operatingSystems: {},     // osName -> count
  categoryViews: {},        // category -> count
  storyDossierViews: {},    // storyTitle/id -> count
  audioBriefingsPlayed: 0,
  bookmarksAdded: 0,
  hourlyActivity: {},       // YYYY-MM-DD-HH -> count
  recentEvents: []          // Last 50 events
};

// ── Security & Authentication ─────────────────────────────────────
const ADMIN_PIN = process.env.ADMIN_PIN || '7799';
const activeTokens = new Set();
const failedAttempts = new Map(); // ip -> { count, lastAttempt }

// Helper to hash IP + User-Agent for privacy-safe unique visitor counts
function hashVisitor(ip, userAgent) {
  const dateStr = new Date().toISOString().slice(0, 10);
  return crypto.createHash('sha256').update(`${ip}-${userAgent}-${dateStr}`).digest('hex').slice(0, 16);
}

// Helper to detect device
function detectDevice(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
    return 'tablet';
  }
  if (/mobi|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|wpdesktop/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectOS(ua = '') {
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function detectBrowser(ua = '') {
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/opr|opera/i.test(ua)) return 'Opera';
  return 'Browser';
}

// ── Public Analytics Ingestion ────────────────────────────────────
export function trackEvent({
  eventType = 'pageview',
  path = '/',
  referrer = 'direct',
  metadata = {},
  ip = '127.0.0.1',
  userAgent = ''
}) {
  const now = Date.now();
  const visitorHash = hashVisitor(ip, userAgent);
  
  // Track pageviews & unique visitors
  if (eventType === 'pageview') {
    analyticsState.totalPageviews++;
    analyticsState.uniqueVisitorHashes.add(visitorHash);
    analyticsState.activeSessions.set(visitorHash, now);

    // Device / OS / Browser
    const dev = detectDevice(userAgent);
    analyticsState.devices[dev] = (analyticsState.devices[dev] || 0) + 1;

    const os = detectOS(userAgent);
    analyticsState.operatingSystems[os] = (analyticsState.operatingSystems[os] || 0) + 1;

    const browser = detectBrowser(userAgent);
    analyticsState.browsers[browser] = (analyticsState.browsers[browser] || 0) + 1;

    // Referrer
    const cleanRef = referrer && referrer !== '' ? referrer.replace(/^https?:\/\//, '').split('/')[0] : 'Direct';
    analyticsState.referrers[cleanRef] = (analyticsState.referrers[cleanRef] || 0) + 1;
  }

  // Hourly timeline bucket
  const hourKey = new Date().toISOString().slice(0, 13); // e.g. 2026-10-06T20
  analyticsState.hourlyActivity[hourKey] = (analyticsState.hourlyActivity[hourKey] || 0) + 1;

  // Custom action metrics
  if (eventType === 'dossier_open' && metadata.title) {
    analyticsState.storyDossierViews[metadata.title] = (analyticsState.storyDossierViews[metadata.title] || 0) + 1;
  }
  if (eventType === 'category_filter' && metadata.category) {
    analyticsState.categoryViews[metadata.category] = (analyticsState.categoryViews[metadata.category] || 0) + 1;
  }
  if (eventType === 'audio_briefing_play') {
    analyticsState.audioBriefingsPlayed++;
  }
  if (eventType === 'bookmark_toggle') {
    analyticsState.bookmarksAdded++;
  }

  // Recent Event Log (keep last 50)
  analyticsState.recentEvents.unshift({
    id: crypto.randomBytes(6).toString('hex'),
    timestamp: new Date().toISOString(),
    eventType,
    path,
    referrer: referrer || 'Direct',
    device: detectDevice(userAgent),
    metadata
  });
  if (analyticsState.recentEvents.length > 50) {
    analyticsState.recentEvents.pop();
  }

  return { success: true };
}

// ── Admin Authentication ──────────────────────────────────────────
export function verifyAdminPin(enteredPin, clientIp = '127.0.0.1') {
  // Check brute force throttling
  const attempt = failedAttempts.get(clientIp);
  if (attempt && attempt.count >= 5 && (Date.now() - attempt.lastAttempt < 60000)) {
    return { success: false, error: 'Too many attempts. Locked for 60 seconds.' };
  }

  if (String(enteredPin).trim() === String(ADMIN_PIN).trim()) {
    failedAttempts.delete(clientIp);
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.add(token);
    return { success: true, token };
  }

  const curCount = (attempt ? attempt.count : 0) + 1;
  failedAttempts.set(clientIp, { count: curCount, lastAttempt: Date.now() });
  return { success: false, error: 'Invalid Authorization PIN' };
}

export function validateAdminToken(token) {
  if (!token) return false;
  return activeTokens.has(token);
}

// ── Dashboard Metrics Aggregator ──────────────────────────────────
export function getAdminDashboardMetrics() {
  const now = Date.now();
  const fifteenMinsAgo = now - 15 * 60 * 1000;

  // Prune & count active sessions in last 15 min
  let activeCount = 0;
  for (const [hash, lastSeen] of analyticsState.activeSessions.entries()) {
    if (lastSeen > fifteenMinsAgo) {
      activeCount++;
    } else {
      analyticsState.activeSessions.delete(hash);
    }
  }

  // Top referrers sorted
  const topReferrers = Object.entries(analyticsState.referrers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([source, count]) => ({ source, count }));

  // Top categories sorted
  const topCategories = Object.entries(analyticsState.categoryViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count]) => ({ category, count }));

  // Top dossier reads sorted
  const topDossiers = Object.entries(analyticsState.storyDossierViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([title, count]) => ({ title, count }));

  // Recent 12 hours timeline
  const last12Hours = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now - i * 3600 * 1000);
    const key = d.toISOString().slice(0, 13);
    const label = `${d.getHours()}:00`;
    last12Hours.push({
      hour: label,
      views: analyticsState.hourlyActivity[key] || 0
    });
  }

  const memoryUsage = process.memoryUsage();

  return {
    overview: {
      totalPageviews: analyticsState.totalPageviews,
      uniqueVisitors: analyticsState.uniqueVisitorHashes.size,
      activeSessionsNow: Math.max(activeCount, 1), // At least current admin
      audioBriefingsPlayed: analyticsState.audioBriefingsPlayed,
      bookmarksAdded: analyticsState.bookmarksAdded,
      uptimeSeconds: Math.floor(process.uptime()),
      startedAt: analyticsState.startedAt
    },
    devices: analyticsState.devices,
    browsers: analyticsState.browsers,
    operatingSystems: analyticsState.operatingSystems,
    topReferrers,
    topCategories,
    topDossiers,
    timeline: last12Hours,
    recentEvents: analyticsState.recentEvents.slice(0, 20),
    system: {
      nodeVersion: process.version,
      rssMemoryMb: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    }
  };
}

export function resetAnalyticsData() {
  analyticsState.totalPageviews = 0;
  analyticsState.uniqueVisitorHashes.clear();
  analyticsState.activeSessions.clear();
  analyticsState.referrers = {};
  analyticsState.devices = { desktop: 0, mobile: 0, tablet: 0 };
  analyticsState.browsers = {};
  analyticsState.operatingSystems = {};
  analyticsState.categoryViews = {};
  analyticsState.storyDossierViews = {};
  analyticsState.audioBriefingsPlayed = 0;
  analyticsState.bookmarksAdded = 0;
  analyticsState.hourlyActivity = {};
  analyticsState.recentEvents = [];
  return { success: true, message: 'Analytics reset.' };
}
