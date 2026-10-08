import React, { useMemo } from 'react';
import { TrendingUp, Flame, Newspaper, ExternalLink } from 'lucide-react';
import { SOURCE_BRANDS } from '../services/newsService.js';

export default function TrendingPanel({ liveItems, curatedStories, onSelectStory, onSelectLive }) {
  // Top trending live dispatches by trust score * recency
  const hotLive = useMemo(() => {
    return [...liveItems]
      .sort((a, b) => {
        const tA = new Date(a.publishedAt).getTime();
        const tB = new Date(b.publishedAt).getTime();
        const scoreA = (a.trustScore || 80) + (tA / 1e12);
        const scoreB = (b.trustScore || 80) + (tB / 1e12);
        return scoreB - scoreA;
      })
      .slice(0, 8);
  }, [liveItems]);

  // Curated stories by urgency
  const urgentCurated = useMemo(() => {
    return [...curatedStories]
      .filter(s => s.urgency === 'BREAKING' || s.urgency === 'CRITICAL')
      .slice(0, 4);
  }, [curatedStories]);

  return (
    <div className="trending-panel">
      {/* Breaking curated */}
      {urgentCurated.length > 0 && (
        <section className="tp-section">
          <h4 className="tp-header"><Flame size={14} /> Breaking Intelligence</h4>
          <ul className="tp-list curated">
            {urgentCurated.map(s => (
              <li key={s.id} onClick={() => onSelectStory(s)} className="tp-item">
                <span className={`urgency-dot ${s.urgency?.toLowerCase() || 'standard'}`} />
                <div>
                  <p className="tp-title">{s.title}</p>
                  <span className="tp-meta">{s.region} · {s.timestamp}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Hot live wire */}
      {hotLive.length > 0 && (
        <section className="tp-section">
          <h4 className="tp-header"><TrendingUp size={14} /> Live Wire Hot</h4>
          <ul className="tp-list live">
            {hotLive.map(item => {
              const brand = SOURCE_BRANDS[item.sourceId] || {};
              return (
                <li
                  key={item.id}
                  className="tp-item"
                  onClick={() => onSelectLive(item.url)}
                >
                  <span className="tp-brand-icon" title={item.sourceName}>{brand.icon || '📡'}</span>
                  <div>
                    <p className="tp-title">{item.title?.substring(0, 80)}{item.title?.length > 80 ? '…' : ''}</p>
                    <span className="tp-meta" style={{ color: brand.color || 'var(--text-muted)' }}>
                      {item.sourceName} · {item.timeAgo}
                    </span>
                  </div>
                  <ExternalLink size={11} className="tp-ext-icon" />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Sourced from */}
      <div className="tp-source-legend">
        <Newspaper size={12} />
        <span>Powered by 26 international press sources</span>
      </div>
    </div>
  );
}
