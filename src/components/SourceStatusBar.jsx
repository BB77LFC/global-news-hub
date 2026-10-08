import React from 'react';
import { RefreshCw, Radio, CheckCircle, Wifi } from 'lucide-react';

export default function SourceStatusBar({ liveFeedStats, lastSynced, isSyncing, onSync }) {
  const fmtTime = (d) => {
    if (!d) return 'Never synced';
    const now = Date.now();
    const diffMin = Math.floor((now - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="source-status-bar">
      <div className="ssb-left">
        <div className={`ssb-indicator ${liveFeedStats.count > 0 ? 'live' : 'idle'}`}>
          <Wifi size={12} />
          <span>{liveFeedStats.count > 0 ? `LIVE WIRE` : 'CONNECTING'}</span>
        </div>
        <span className="ssb-stat">
          <CheckCircle size={11} />
          {liveFeedStats.count} dispatches from {liveFeedStats.sources} sources
        </span>
        <span className="ssb-stat muted">
          Last synced: {fmtTime(lastSynced)}
        </span>
      </div>

      <div className="ssb-right">
        <div className="ssb-pulse-dots">
          <span className="pulse-dot" style={{ '--delay': '0ms' }} />
          <span className="pulse-dot" style={{ '--delay': '300ms' }} />
          <span className="pulse-dot" style={{ '--delay': '600ms' }} />
        </div>
        <button
          className={`ssb-refresh-btn ${isSyncing ? 'spinning' : ''}`}
          onClick={() => onSync()}
          disabled={isSyncing}
          title="Force sync live wire"
          id="source-status-sync-btn"
        >
          <RefreshCw size={13} className={isSyncing ? 'spin' : ''} />
          {isSyncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
}
