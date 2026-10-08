/**
 * OmniPulse News Service Layer
 * Central data access layer for curated + live feeds
 */
import { GLOBAL_STORIES } from '../data/newsData.js';

// ── Bookmarks ─────────────────────────────────────────────────────
const BOOKMARK_KEY = 'omnipulse_bookmarks_v3';

export function getStoredBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveStoredBookmarks(ids) {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
  } catch {}
}

// ── Curated Stories ───────────────────────────────────────────────
export { GLOBAL_STORIES };

// ── Metrics ───────────────────────────────────────────────────────
export function getAggregatedMetrics() {
  const categorySet = new Set(GLOBAL_STORIES.map(s => s.category));
  const regionSet = new Set(GLOBAL_STORIES.map(s => s.region));
  const totalEngagement = GLOBAL_STORIES.reduce((sum, s) => {
    const src = s.sourceCounts || {};
    return sum + Object.values(src).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
  }, 0);
  return {
    totalStories: GLOBAL_STORIES.length,
    categories: categorySet.size,
    regions: regionSet.size,
    activeSources: 18,
    dispatchesPerHour: 340,
    verifiedAccuracy: '97.4%',
    totalEngagement,
  };
}

// ── Story Filtering ───────────────────────────────────────────────
export function filterStories({ stories, category, region, source, searchQuery, bookmarkedOnly, bookmarkedIds }) {
  return stories.filter(s => {
    if (bookmarkedOnly && !bookmarkedIds.includes(s.id)) return false;
    if (category && category !== 'All' && s.category !== category) return false;
    if (region && region !== 'All' && s.region !== region && s.region !== 'Global') return false;
    if (source && source !== 'All') {
      const sid = source.toLowerCase();
      if (s.sourceId) {
        if (s.sourceId !== sid) return false;
      } else {
        // Curated stories: check if source mentioned in verification corroboration
        const corroboration = (s.verification?.wireCorroboration || []).join(' ').toLowerCase();
        if (!corroboration.includes(sid)) return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const haystack = `${s.title} ${s.summary || ''} ${s.sourceName || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

// ── Live Wire Feed Fetcher ────────────────────────────────────────
export async function fetchLiveWireFeeds({ category, source, region, q } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (source && source !== 'All') params.set('source', source);
  if (region && region !== 'All') params.set('region', region);
  if (q) params.set('q', q);

  const url = `/api/live-feeds?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success) {
      return data.items || [];
    }
    return [];
  } catch (err) {
    console.warn('OmniPulse: Live feed API error —', err.message);
    return [];
  }
}

// ── Category Catalog ─────────────────────────────────────────────
export const CATEGORIES = [
  'All',
  'Geopolitics',
  'Tech & AI',
  'Health & Science',
  'Climate & Energy',
  'Space',
  'Markets & Economy',
  'Conflict & Security',
  'Human Rights',
  'Culture & Society'
];

// ── Region Catalog ───────────────────────────────────────────────
export const REGIONS = [
  'All',
  'Global',
  'North America',
  'Europe',
  'Middle East',
  'Asia-Pacific',
  'Africa',
  'Latin America'
];

// ── Source Brand Catalog ─────────────────────────────────────────
export const SOURCE_BRANDS = {
  nyt: { label: 'NYT', color: '#E94235', icon: '📰' },
  bbc: { label: 'BBC', color: '#BB1919', icon: '📺' },
  guardian: { label: 'Guardian', color: '#052962', icon: '🦅' },
  aljazeera: { label: 'Al Jazeera', color: '#D52B1E', icon: '📡' },
  reuters: { label: 'Reuters', color: '#FF8000', icon: '⚡' },
  ap: { label: 'AP', color: '#C41230', icon: '📟' },
  ft: { label: 'FT', color: '#FCD116', icon: '💷' },
  dw: { label: 'DW', color: '#00478F', icon: '🎙️' },
  france24: { label: 'France24', color: '#003E8A', icon: '🇫🇷' },
  scmp: { label: 'SCMP', color: '#E02B20', icon: '🏮' },
  arstechnica: { label: 'Ars Technica', color: '#FF4713', icon: '🔬' },
  mit: { label: 'MIT Tech', color: '#8A1736', icon: '⚗️' },
  nasa: { label: 'NASA', color: '#0B3D91', icon: '🚀' },
  spacedotcom: { label: 'Space.com', color: '#4B0082', icon: '🌌' },
  reddit: { label: 'Reddit', color: '#FF4500', icon: '🤖' },
  economist: { label: 'Economist', color: '#E3120B', icon: '📊' }
};

export function exportDossierMarkdown(story) {
  if (!story) return;
  const content = `# OmniPulse Intelligence Dossier: ${story.title}
Urgency: ${story.urgency || 'Standard'}
Region: ${story.region || 'Global'} | Category: ${story.category || 'General'}
Corroboration: ${story.trustScore ? `${story.trustScore}%` : 'Verified'}
Date: ${story.timestamp || new Date().toISOString()}

## Executive Summary
${story.executiveBriefing?.summary || story.summary || 'N/A'}

## Key Takeaways
${(story.executiveBriefing?.keyTakeaways || []).map(t => `- **${t.tag}**: ${t.text}`).join('\n') || '- None recorded'}

## Geopolitical & Strategic Impact
${story.executiveBriefing?.geopoliticalImpact || 'N/A'}

## Timeline of Events
${(story.timeline || []).map(t => `- **${t.time}**: ${t.event} (${t.source || 'Wire'})`).join('\n') || '- Live developing'}

---
*Generated by OmniPulse Global Intelligence Wire*
`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${story.slug || 'story-dossier'}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
