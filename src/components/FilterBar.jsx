import React, { useState } from 'react';
import {
  Globe, Grid, AlignJustify, RefreshCw, MapPin, SlidersHorizontal, Zap
} from 'lucide-react';
import { CATEGORIES, REGIONS, SOURCE_BRANDS } from '../services/newsService.js';

const SOURCE_FILTER_IDS = Object.keys(SOURCE_BRANDS);

export default function FilterBar({
  selectedCategory, setSelectedCategory,
  selectedSource, setSelectedSource,
  selectedRegion, setSelectedRegion,
  viewMode, setViewMode,
  streamMode, setStreamMode,
  onSyncLiveFeeds, isSyncing,
  totalResults
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="filter-bar-root">
      {/* Stream Mode Toggle */}
      <div className="filter-row stream-mode-row">
        <div className="stream-toggle-group">
          {[
            { id: 'all', icon: <Globe size={13} />, label: 'Master Intelligence Stream' },
            { id: 'curated', icon: <Zap size={13} />, label: 'Curated Dossiers' },
            { id: 'live', icon: <span className="live-dot-sm" />, label: 'Live Wire Only' }
          ].map(m => (
            <button
              key={m.id}
              className={`stream-btn ${streamMode === m.id ? 'active' : ''}`}
              onClick={() => setStreamMode(m.id)}
              id={`stream-toggle-${m.id}`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        <div className="filter-meta-right">
          <span className="result-count-pill">{totalResults} results</span>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              id="view-toggle-grid"
            >
              <Grid size={14} />
            </button>
            <button
              className={viewMode === 'dense' ? 'active' : ''}
              onClick={() => setViewMode('dense')}
              title="Dense List View"
              id="view-toggle-dense"
            >
              <AlignJustify size={14} />
            </button>
            <button
              className={viewMode === 'regions' ? 'active' : ''}
              onClick={() => setViewMode(v => v === 'regions' ? 'grid' : 'regions')}
              title="Region Radar"
              id="view-toggle-regions"
            >
              <MapPin size={14} />
            </button>
          </div>

          <button
            className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(p => !p)}
            id="advanced-filter-toggle"
          >
            <SlidersHorizontal size={13} />
            Filters
          </button>

          <button
            className={`sync-btn ${isSyncing ? 'spinning' : ''}`}
            onClick={onSyncLiveFeeds}
            disabled={isSyncing}
            id="filter-bar-sync-btn"
          >
            <RefreshCw size={12} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Syncing…' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Category Row */}
      <div className="filter-row categories-row">
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              id={`cat-pill-${cat.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced: Region + Source */}
      {showAdvanced && (
        <div className="filter-advanced-panel">
          {/* Region */}
          <div className="adv-group">
            <label className="adv-label"><MapPin size={12} /> Region</label>
            <div className="adv-chips">
              {REGIONS.map(r => (
                <button
                  key={r}
                  className={`adv-chip ${selectedRegion === r ? 'active' : ''}`}
                  onClick={() => setSelectedRegion(r)}
                  id={`region-chip-${r.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Source brand */}
          <div className="adv-group">
            <label className="adv-label"><Globe size={12} /> Source</label>
            <div className="adv-chips">
              <button
                className={`adv-chip ${selectedSource === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedSource('All')}
                id="source-chip-all"
              >
                All Sources
              </button>
              {SOURCE_FILTER_IDS.map(sid => {
                const brand = SOURCE_BRANDS[sid];
                return (
                  <button
                    key={sid}
                    className={`adv-chip brand ${selectedSource === sid ? 'active' : ''}`}
                    style={{
                      '--brand-color': brand.color,
                      borderColor: selectedSource === sid ? brand.color : 'transparent'
                    }}
                    onClick={() => setSelectedSource(sid)}
                    id={`source-chip-${sid}`}
                  >
                    {brand.icon} {brand.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedCategory !== 'All' || selectedSource !== 'All' || selectedRegion !== 'All') && (
            <button
              className="adv-clear-btn"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSource('All');
                setSelectedRegion('All');
              }}
            >
              ✕ Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
