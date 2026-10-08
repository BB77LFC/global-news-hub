import React, { useState } from 'react';
import { X, Activity, Radio, ExternalLink, MessageCircle, Heart, Repeat, Filter } from 'lucide-react';
import { LIVE_SOCIAL_DISPATCHES } from '../data/newsData';

export default function LiveSocialDrawer({ isOpen, onClose, onSelectStoryByKeyword }) {
  const [filterPlatform, setFilterPlatform] = useState('all'); // 'all' | 'x' | 'instagram'

  if (!isOpen) return null;

  const filteredDispatches = LIVE_SOCIAL_DISPATCHES.filter(d => {
    if (filterPlatform === 'all') return true;
    return d.platform === filterPlatform;
  });

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="social-drawer">
        <div className="drawer-header">
          <div className="drawer-title">
            <span className="pulse-dot" style={{ width: '8px', height: '8px' }}></span>
            <span>Real-Time Social Wire</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close Social Wire">
            <X size={16} />
          </button>
        </div>

        {/* Platform quick switch */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem', background: 'rgba(7, 9, 14, 0.4)' }}>
          <button
            className={`source-pill ${filterPlatform === 'all' ? 'active-all' : ''}`}
            onClick={() => setFilterPlatform('all')}
          >
            All Feeds
          </button>
          <button
            className={`source-pill ${filterPlatform === 'x' ? 'active-x' : ''}`}
            onClick={() => setFilterPlatform('x')}
          >
            𝕏 Twitter
          </button>
          <button
            className={`source-pill ${filterPlatform === 'instagram' ? 'active-instagram' : ''}`}
            onClick={() => setFilterPlatform('instagram')}
          >
            📸 Instagram
          </button>
        </div>

        {/* Stream List */}
        <div className="drawer-feed-list">
          {filteredDispatches.map((dispatch) => (
            <div
              key={dispatch.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${dispatch.platform === 'x' ? 'rgba(29,155,240,0.3)' : 'rgba(225,48,108,0.3)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'transform var(--transition-fast)'
              }}
              onClick={() => onSelectStoryByKeyword(dispatch.category)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={dispatch.avatar} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {dispatch.author}
                      {dispatch.platform === 'x' ? (
                        <span style={{ color: 'var(--brand-x)', fontSize: '0.75rem' }}>✓</span>
                      ) : (
                        <span style={{ color: '#ff5277', fontSize: '0.7rem' }}>●</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dispatch.handle} • {dispatch.time}</div>
                  </div>
                </div>

                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: dispatch.platform === 'x' ? 'var(--brand-x-bg)' : 'var(--brand-instagram-bg)',
                  color: dispatch.platform === 'x' ? 'var(--brand-x)' : '#ff5277'
                }}>
                  {dispatch.platform === 'x' ? '𝕏 Wire' : 'IG Visual'}
                </span>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: '1.45', marginBottom: '0.6rem' }}>
                {dispatch.text}
              </p>

              {dispatch.media && (
                <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '140px', marginBottom: '0.6rem' }}>
                  <img src={dispatch.media} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>{dispatch.engagement}</span>
                <span style={{ color: 'var(--accent-cyan)' }}>Find Story →</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
