import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { BREAKING_TICKER_ITEMS } from '../data/newsData';

export default function BreakingTicker({ onSelectTickerStory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREAKING_TICKER_ITEMS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentItem = BREAKING_TICKER_ITEMS[currentIndex];

  return (
    <div
      className="ticker-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="ticker-label">
        <span className="pulse-dot"></span>
        <span>BREAKING WIRE</span>
      </div>

      <div className="ticker-content">
        <div
          className="ticker-item"
          onClick={() => onSelectTickerStory(currentItem)}
          title="Click to inspect this breaking story"
        >
          <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
            [{currentItem.tag}]
          </span>
          <span style={{ fontWeight: '500' }}>{currentItem.text}</span>
          <span className="ticker-source-tag">• {currentItem.source} • {currentItem.time}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>{currentIndex + 1}/{BREAKING_TICKER_ITEMS.length}</span>
        <button
          onClick={() => setCurrentIndex((currentIndex + 1) % BREAKING_TICKER_ITEMS.length)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Next wire alert"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
