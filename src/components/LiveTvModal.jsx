import React, { useState } from 'react';
import { X, Tv, Radio, Volume2, ShieldCheck } from 'lucide-react';
import { LIVE_TV_CHANNELS } from '../data/newsData';

export default function LiveTvModal({ isOpen, onClose }) {
  const [selectedChannel, setSelectedChannel] = useState(LIVE_TV_CHANNELS[0]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="tv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar" style={{ background: 'rgba(18, 12, 24, 0.9)' }}>
          <div className="modal-title-wrap">
            <span className="pulse-dot" style={{ background: '#ff0000', boxShadow: '0 0 10px #ff0000' }}></span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>
              24/7 Global Satellite News Wire
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
              ● {selectedChannel.name} • {selectedChannel.country}
            </span>
          </div>

          <button className="modal-close-btn" onClick={onClose} title="Close TV Feed">
            <X size={18} />
          </button>
        </div>

        {/* Video Frame */}
        <div className="tv-video-container">
          <iframe
            src={selectedChannel.embedUrl}
            title={selectedChannel.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Channel Switcher */}
        <div className="tv-channels-bar">
          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Satellite Feeds:
          </span>
          {LIVE_TV_CHANNELS.map((channel) => {
            const isActive = selectedChannel.id === channel.id;
            return (
              <button
                key={channel.id}
                className={`channel-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedChannel(channel)}
              >
                <Tv size={13} />
                <span>{channel.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
