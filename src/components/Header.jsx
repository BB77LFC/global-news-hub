import React, { useState, useEffect, useRef } from 'react';
import { Radio, Search, Bookmark, Tv2, Zap, Menu, X, BarChart3, Shield } from 'lucide-react';

export default function Header({
  searchQuery, setSearchQuery,
  bookmarkedOnly, setBookmarkedOnly,
  bookmarkCount,
  isDrawerOpen, setIsDrawerOpen,
  onOpenLiveTv,
  onOpenAdminAnalytics,
  lastSynced
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard shortcut: Ctrl+K or / to focus search, Ctrl+Shift+A for Admin Analytics
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdminAnalytics?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpenAdminAnalytics]);

  const fmtSynced = (d) => {
    if (!d) return '';
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    return diffMin < 1 ? ' · Synced just now' : ` · Synced ${diffMin}m ago`;
  };

  return (
    <header className={`omnipulse-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        {/* Brand */}
        <div className="header-brand">
          <div className="brand-logo-wrap">
            <div className="brand-pulse-ring" />
            <Radio size={22} color="var(--accent-cyan)" />
          </div>
          <div className="brand-text">
            <span className="brand-name">OmniPulse</span>
            <span className="brand-tagline">Global Intelligence Hub{fmtSynced(lastSynced)}</span>
          </div>
        </div>

        {/* Center Search */}
        <div className={`header-search-wrap ${searchFocused ? 'focused' : ''}`}>
          <Search size={15} className="search-icon-left" />
          <input
            ref={searchRef}
            type="text"
            className="header-search-input"
            placeholder="Search headlines, sources, regions… (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            id="global-search-input"
            aria-label="Search global news"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
          <span className="search-shortcut-badge">⌘K</span>
        </div>

        {/* Right Actions */}
        <div className="header-actions">
          <button
            className={`header-action-btn ${bookmarkedOnly ? 'active' : ''}`}
            onClick={() => setBookmarkedOnly(p => !p)}
            title="Bookmarks"
            id="header-bookmarks-btn"
          >
            <Bookmark size={16} />
            {bookmarkCount > 0 && (
              <span className="header-badge">{bookmarkCount}</span>
            )}
          </button>

          <button
            className="header-action-btn live-tv"
            onClick={onOpenLiveTv}
            title="24/7 Live TV"
            id="header-live-tv-btn"
          >
            <Tv2 size={16} />
            <span className="live-dot-btn" />
            <span className="btn-label">LIVE TV</span>
          </button>

          <button
            className={`header-action-btn social-wire-btn ${isDrawerOpen ? 'active' : ''}`}
            onClick={() => setIsDrawerOpen(p => !p)}
            title="Social Wire"
            id="header-social-wire-btn"
          >
            <Zap size={16} />
            <span className="btn-label">Social Wire</span>
          </button>

          <button
            className="header-action-btn"
            onClick={onOpenAdminAnalytics}
            title="Classified Owner Telemetry (Ctrl+Shift+A)"
            id="header-admin-telemetry-btn"
            style={{ opacity: 0.8 }}
          >
            <BarChart3 size={16} />
            <span className="btn-label" style={{ fontSize: '0.72rem' }}>Analytics</span>
          </button>

          <button
            className="header-action-btn mobile-menu"
            onClick={() => setIsDrawerOpen(p => !p)}
            id="header-mobile-menu-btn"
            aria-label="Menu"
          >
            {isDrawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
