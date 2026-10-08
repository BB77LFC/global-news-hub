import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import BreakingTicker from './components/BreakingTicker';
import FilterBar from './components/FilterBar';
import StoryCard from './components/StoryCard';
import LiveWireCard from './components/LiveWireCard';
import StoryDossierModal from './components/StoryDossierModal';
import LiveSocialDrawer from './components/LiveSocialDrawer';
import WorldRegionMap from './components/WorldRegionMap';
import LiveTvModal from './components/LiveTvModal';
import TrendingPanel from './components/TrendingPanel';
import SourceStatusBar from './components/SourceStatusBar';
import AdminAnalyticsModal from './components/AdminAnalyticsModal';
import { trackVisit } from './services/telemetryClient';
import {
  GLOBAL_STORIES,
  filterStories,
  getStoredBookmarks,
  saveStoredBookmarks,
  getAggregatedMetrics,
  fetchLiveWireFeeds
} from './services/newsService';
import { Radio, TrendingUp } from 'lucide-react';

export default function App() {
  // ── Data state ──────────────────────────────────
  const [curatedStories] = useState(GLOBAL_STORIES);
  const [liveWireItems, setLiveWireItems] = useState([]);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [liveFeedStats, setLiveFeedStats] = useState({ count: 0, sources: 0 });
  const syncTimerRef = useRef(null);

  // ── UI state ─────────────────────────────────────
  const [streamMode, setStreamMode] = useState('all'); // 'all' | 'curated' | 'live'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'dense' | 'regions'
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(getStoredBookmarks());

  // ── Modal state ───────────────────────────────────
  const [selectedStory, setSelectedStory] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTvModalOpen, setIsTvModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // ── Live feed sync ────────────────────────────────
  const syncLiveWire = useCallback(async (silent = false) => {
    if (!silent) setIsSyncingLive(true);
    try {
      const items = await fetchLiveWireFeeds();
      if (items?.length > 0) {
        setLiveWireItems(items);
        setLiveFeedStats({ count: items.length, sources: new Set(items.map(i => i.sourceId)).size });
        setLastSynced(new Date());
      }
    } catch (err) {
      console.warn('Live wire sync error:', err);
    } finally {
      if (!silent) setIsSyncingLive(false);
    }
  }, []);

  useEffect(() => {
    // Record pageview telemetry
    trackVisit('pageview');

    // Immediate first fetch
    syncLiveWire();

    // Auto-refresh every 90 seconds in background
    syncTimerRef.current = setInterval(() => syncLiveWire(true), 90000);

    // Deep-link: ?story=<id>
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('story');
    if (storyId) {
      const match = curatedStories.find(s => s.id === storyId || s.slug === storyId);
      if (match) setSelectedStory(match);
    }

    return () => clearInterval(syncTimerRef.current);
  }, [syncLiveWire]);

  // URL deep-link sync
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedStory && !selectedStory.isLiveWire) {
      url.searchParams.set('story', selectedStory.id);
    } else {
      url.searchParams.delete('story');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedStory]);

  // ── Bookmarks ─────────────────────────────────────
  const handleToggleBookmark = useCallback((id) => {
    setBookmarkedIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveStoredBookmarks(updated);
      return updated;
    });
  }, []);

  // ── Active pool based on stream mode ─────────────
  const activePool = (() => {
    if (streamMode === 'curated') return curatedStories;
    if (streamMode === 'live') return liveWireItems.length > 0 ? liveWireItems : [];
    // 'all': curated first (pinned), then live wire below
    return [...curatedStories, ...liveWireItems];
  })();

  const displayedStories = filterStories({
    stories: activePool,
    category: selectedCategory,
    region: selectedRegion,
    source: selectedSource,
    searchQuery,
    bookmarkedOnly,
    bookmarkedIds
  });

  const metrics = getAggregatedMetrics();
  const totalSources = metrics.activeSources + liveFeedStats.sources;

  return (
    <div className="app-root">
      {/* Sticky Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        bookmarkedOnly={bookmarkedOnly}
        setBookmarkedOnly={setBookmarkedOnly}
        bookmarkCount={bookmarkedIds.length}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onOpenLiveTv={() => setIsTvModalOpen(true)}
        onOpenAdminAnalytics={() => setIsAdminModalOpen(true)}
        lastSynced={lastSynced}
      />

      {/* Breaking Ticker */}
      <BreakingTicker
        liveItems={liveWireItems.slice(0, 8)}
        onSelectTickerStory={(item) => {
          if (item.isLiveWire) {
            window.open(item.url, '_blank');
          } else {
            const found = curatedStories.find(s =>
              s.category?.toLowerCase().includes(item.tag?.toLowerCase()) ||
              s.title?.toLowerCase().includes(item.tag?.toLowerCase())
            );
            setSelectedStory(found || curatedStories[0]);
          }
        }}
      />

      {/* Source Status Bar */}
      <SourceStatusBar
        liveFeedStats={liveFeedStats}
        lastSynced={lastSynced}
        isSyncing={isSyncingLive}
        onSync={syncLiveWire}
      />

      <main className="app-container">
        {/* Hero Banner */}
        <section className="hero-hub">
          <div className="hero-headings">
            <h1>OmniPulse Global Intelligence Hub</h1>
            <p className="hero-subtext">
              Real-time aggregation from <strong>{totalSources}+ international news sources</strong> — wire services, investigative press, social dispatches, and community analysis — all verified, clustered, and cross-referenced.
            </p>
          </div>

          <div className="hero-stats-panel">
            <div className="stat-item">
              <span className="stat-num">{totalSources}+</span>
              <span className="stat-desc">Active Sources</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{(curatedStories.length + liveWireItems.length)}</span>
              <span className="stat-desc">Stories Live</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{metrics.dispatchesPerHour}/h</span>
              <span className="stat-desc">Dispatch Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-num" style={{ color: 'var(--accent-emerald)' }}>{metrics.verifiedAccuracy}</span>
              <span className="stat-desc">Cross-Verified</span>
            </div>
          </div>
        </section>

        {/* Region Radar */}
        {(viewMode === 'regions' || selectedRegion !== 'All') && (
          <WorldRegionMap
            selectedRegion={selectedRegion}
            onSelectRegion={(reg) => setSelectedRegion(reg)}
          />
        )}

        {/* Filter / Stream Controls */}
        <FilterBar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          viewMode={viewMode}
          setViewMode={setViewMode}
          streamMode={streamMode}
          setStreamMode={setStreamMode}
          onSyncLiveFeeds={syncLiveWire}
          isSyncing={isSyncingLive}
          totalResults={displayedStories.length}
        />

        {/* Main Content + Sidebar Layout */}
        <div className="content-with-sidebar">
          <div className="main-feed-column">
            {displayedStories.length > 0 ? (
              <div className={`stories-grid ${viewMode === 'dense' ? 'dense' : ''}`}>
                {displayedStories.map((story) =>
                  story.isLiveWire ? (
                    <LiveWireCard
                      key={story.id}
                      story={story}
                      isBookmarked={bookmarkedIds.includes(story.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ) : (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onOpenDossier={(s) => {
                        setSelectedStory(s);
                        trackVisit('dossier_open', { title: s.title, category: s.category });
                      }}
                      isBookmarked={bookmarkedIds.includes(story.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="empty-state">
                <Radio size={42} color="var(--accent-cyan)" />
                <h3>No dispatches match your filters</h3>
                <p>Switch to "Master Intelligence Stream" or click "Sync Live Wire" to pull fresh dispatches.</p>
                <button
                  className="icon-btn active"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSource('All');
                    setSelectedRegion('All');
                    setSearchQuery('');
                    setBookmarkedOnly(false);
                    setStreamMode('all');
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Trending Sidebar */}
          {viewMode !== 'dense' && (
            <aside className="sidebar-column">
              <TrendingPanel
                liveItems={liveWireItems}
                curatedStories={curatedStories}
                onSelectStory={(s) => setSelectedStory(s)}
                onSelectLive={(url) => window.open(url, '_blank')}
              />
            </aside>
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      {selectedStory && !selectedStory.isLiveWire && (
        <StoryDossierModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          isBookmarked={bookmarkedIds.includes(selectedStory.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      <LiveTvModal isOpen={isTvModalOpen} onClose={() => setIsTvModalOpen(false)} />

      <LiveSocialDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectStoryByKeyword={(cat) => {
          setSelectedCategory(cat);
          setIsDrawerOpen(false);
        }}
      />

      {/* Owner Classified Telemetry & Analytics Terminal */}
      <AdminAnalyticsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}
