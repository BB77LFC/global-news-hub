import React from 'react';
import { Bookmark, Clock, ArrowUpRight, ShieldCheck, ExternalLink } from 'lucide-react';

export default function StoryCard({
  story,
  onOpenDossier,
  isBookmarked,
  onToggleBookmark
}) {
  const {
    id,
    title,
    category,
    urgency,
    region,
    timestamp,
    readTime,
    coverImage,
    imageUrl,
    featured,
    executiveBriefing,
    summary,
    sourceCounts,
    platformData,
    trustScore,
    isLiveWire,
    sourceName,
    brandClass,
    url,
    timeAgo
  } = story;

  // Handle Live Wire Card
  if (isLiveWire) {
    return (
      <article
        className="live-wire-card"
        onClick={() => window.open(url, '_blank')}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className={`platform-chip ${brandClass || 'chip-nyt'}`}>
            {sourceName}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
            ● LIVE WIRE
          </span>
        </div>

        {imageUrl && (
          <div style={{ width: '100%', height: '160px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.85rem' }}>
            <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          </div>
        )}

        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', lineHeight: '1.35', marginBottom: '0.6rem', color: '#fff' }}>
          {title}
        </h3>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem', flex: 1 }}>
          {summary}
        </p>

        <div className="card-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />{timeAgo || 'Recent'} • {category}
          </span>

          <span className="dossier-action-link">
            Read Live Dispatch <ExternalLink size={12} />
          </span>
        </div>
      </article>
    );
  }

  // Handle Master Clustered Story Dossier Card
  const previewQuote = platformData?.nyt?.pullquote || platformData?.x?.tweets?.[0]?.content;
  const quoteAuthor = platformData?.nyt?.author ? `NYT: ${platformData.nyt.author}` : platformData?.x?.tweets?.[0]?.handle;

  return (
    <article
      className={`story-card ${featured ? 'featured' : ''}`}
      onClick={() => onOpenDossier(story)}
    >
      <div className="card-media-wrapper">
        <img
          src={coverImage || imageUrl}
          alt={title}
          className="card-media"
          loading="lazy"
        />
        <div className="media-gradient-overlay" />

        <div className="card-top-badges">
          <span className={`urgency-badge ${urgency === 'BREAKING' ? 'breaking' : urgency === 'HIGH IMPACT' ? 'high' : 'developing'}`}>
            {urgency === 'BREAKING' && <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />}
            {urgency}
          </span>

          <button
            className={`bookmark-btn ${isBookmarked ? 'saved' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(story.id);
            }}
            title={isBookmarked ? "Remove bookmark" : "Bookmark story"}
          >
            <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        <span className="region-tag">📍 {region}</span>

        {trustScore && (
          <span className="trust-meter-tag" title="Cross-Verified Intelligence Score">
            <ShieldCheck size={13} /> {trustScore}% Verified
          </span>
        )}
      </div>

      <div className="card-content">
        <h2 className="card-title">{title}</h2>

        <p className="card-summary">
          {executiveBriefing?.summary || summary}
        </p>

        {previewQuote && (
          <div className="dispatch-preview-quote">
            "{previewQuote.length > 135 ? previewQuote.substring(0, 135) + '...' : previewQuote}"
            {quoteAuthor && <span className="dispatch-author">— {quoteAuthor}</span>}
          </div>
        )}

        {/* Multi-Platform Ingestion Cluster Badges */}
        <div className="platform-cluster-bar">
          {sourceCounts?.x && (
            <span className="platform-chip chip-x">
              𝕏 {sourceCounts.x} posts
            </span>
          )}
          {sourceCounts?.nyt && (
            <span className="platform-chip chip-nyt">
              NYT {sourceCounts.nyt} reports
            </span>
          )}
          {sourceCounts?.instagram && (
            <span className="platform-chip chip-instagram">
              IG {sourceCounts.instagram} visuals
            </span>
          )}
          {sourceCounts?.reddit && (
            <span className="platform-chip chip-reddit">
              Reddit {sourceCounts.reddit > 1000 ? `${(sourceCounts.reddit / 1000).toFixed(1)}k` : sourceCounts.reddit}
            </span>
          )}
          {sourceCounts?.reuters && (
            <span className="platform-chip chip-reuters">
              Reuters
            </span>
          )}
          {sourceCounts?.bbc && (
            <span className="platform-chip chip-bbc">
              BBC {sourceCounts.bbc}
            </span>
          )}
        </div>

        <div className="card-footer">
          <div className="footer-stats">
            <span><Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />{timestamp}</span>
            <span>•</span>
            <span>{category}</span>
          </div>

          <span className="dossier-action-link">
            360° Dossier <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}
