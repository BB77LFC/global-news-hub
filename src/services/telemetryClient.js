/**
 * OmniPulse Telemetry Client
 * Handles anonymous visitor tracking & secure admin access
 */

const ADMIN_TOKEN_KEY = 'omnipulse_admin_auth_token';

// ── Visitor Telemetry Ingestion ───────────────────────────────────
export async function trackVisit(eventType = 'pageview', metadata = {}) {
  try {
    const payload = {
      eventType,
      path: window.location.pathname + window.location.search,
      referrer: document.referrer || 'direct',
      metadata: {
        ...metadata,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        language: navigator.language || 'en'
      }
    };

    // Use sendBeacon if available for non-blocking telemetry
    if (navigator.sendBeacon && eventType === 'pageview') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
      return;
    }

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (err) {
    // Fail silently so it never interrupts the user's browsing
  }
}

// ── Admin Authentication & Telemetry Fetching ─────────────────────
export function getSavedAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function saveAdminToken(token, persist = false) {
  if (persist) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function loginAdminPin(pin) {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token) {
      saveAdminToken(data.token);
      return { success: true, token: data.token };
    }
    return { success: false, error: data.error || 'Invalid Authorization PIN' };
  } catch (err) {
    return { success: false, error: 'Network error communicating with intelligence node.' };
  }
}

export async function fetchAdminMetrics() {
  const token = getSavedAdminToken();
  if (!token) return { success: false, error: 'No admin session active' };

  try {
    const res = await fetch('/api/admin/analytics', {
      headers: {
        'x-admin-token': token
      }
    });
    if (res.status === 401 || res.status === 403) {
      clearAdminToken();
      return { success: false, error: 'Session expired. Please re-enter PIN.' };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function resetAdminAnalytics() {
  const token = getSavedAdminToken();
  if (!token) return { success: false, error: 'Unauthorized' };

  try {
    const res = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'x-admin-token': token }
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
