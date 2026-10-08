import React, { useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, Share2, TrendingUp, MessageSquare, ArrowUp } from 'lucide-react';
import { SOURCE_BRANDS } from '../services/newsService.js';

const TIER_BADGE = {
  1: { label: 'Tier-1 Wire', color: 'var(--accent-cyan)' },
  2: { label: 'Verified Press', color: 'var(--accent-emerald)' },
  3: { label: 'Community', color: '#FF4500' }
};

export default function LiveWireCard({ story, isBookmarked, onToggleBookmark }) {
  const [expanded, setExpanded] = useState(false);

  const brand = SOURCE_BRANDS[story.sourceId] || {};
  const tier = story.trustScore >= 95 ? 1 : story.trustScore >= 88 ? 2 : 3;
  const tierBadge = TIER_BADGE[tier];

  const handleShare = async () => {
    try {
      await navigator.share({ title: story.title, url: story.url });
    } catch {
      navigator.clipboard?.writeText(story.url);
    }
  };

  return (
    <article className={`livewire-card ${story.sourceId === 'reddit' ? 'reddit-variant' : ''}`}>
      {/* Top bar */}
      <div className="lw-top">
        <div className="lw-source-row">
          <span className="lw-source-icon">{brand.icon || '📡'}</span>
          <span className="lw-source-name" style={{ color: brand.color || 'var(--accent-cyan)' }}>
            {story.sourceName}
          </span>
          <span className="lw-badge" style={{ borderColor: tierBadge.color, color: tierBadge.color }}>
            {tierBadge.label}
          </span>
        </div>
        <span className="lw-time">{story.timeAgo}</span>
      </div>

      {/* Category chip */}
      <span className={`category-chip ${story.brandClass || 'chip-generic'} sm`}>{story.category}</span>

      {/* Image */}
      {story.imageUrl && (
        <div className="lw-image-wrap">
          <img
            src={story.imageUrl}
            alt={story.title}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            loading="lazy"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="lw-title">{story.title}</h3>

      {/* Summary (expandable) */}
      {story.summary && (
        <div className={`lw-summary ${expanded ? 'expanded' : ''}`}>
          <p>{story.summary}</p>
          {story.summary.length > 140 && (
            <button className="lw-expand-toggle" onClick={() => setExpanded(p => !p)}>
              {expanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          )}
        </div>
      )}

      {/* Reddit-specific stats */}
      {story.redditStats && (
        <div className="lw-reddit-stats">
          <span><ArrowUp size={12} /> {story.redditStats.upvotes?.toLocaleString()}</span>
          <span><MessageSquare size={12} /> {story.redditStats.comments?.toLocaleString()}</span>
          <span style={{ opacity: 0.7 }}>{story.redditStats.subreddit}</span>
        </div>
      )}

      {/* Trust score */}
      <div className="lw-trust">
        <TrendingUp size={11} />
        <span>Trust Score: <strong style={{ color: tierBadge.color }}>{story.trustScore}%</strong></span>
        <span className="lw-corroboration">{story.corroboration}</span>
      </div>

      {/* Actions */}
      <div className="lw-actions">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="lw-btn primary"
          id={`livewire-read-${story.id}`}
        >
          <ExternalLink size={13} />
          Read Full Report
        </a>
        <button
          className="lw-btn ghost"
          onClick={() => onToggleBookmark(story.id)}
          aria-label="Bookmark"
          id={`livewire-bookmark-${story.id}`}
        >
          {isBookmarked ? <BookmarkCheck size={14} color="var(--accent-cyan)" /> : <Bookmark size={14} />}
        </button>
        <button
          className="lw-btn ghost"
          onClick={handleShare}
          aria-label="Share"
          id={`livewire-share-${story.id}`}
        >
          <Share2 size={14} />
        </button>
      </div>
    </article>
  );
}
