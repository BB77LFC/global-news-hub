import React from 'react';
import { Globe, Radio, TrendingUp, AlertTriangle } from 'lucide-react';
import { REGIONS_DATA } from '../data/newsData';

export default function WorldRegionMap({ selectedRegion, onSelectRegion }) {
  return (
    <section className="region-dashboard">
      <div className="region-dashboard-header">
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} color="var(--accent-cyan)" />
            Global Geopolitical Radar & Regional Ingestion Volume
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Select a region to focus cross-platform wire streams and localized breaking developments.
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>
          ● LIVE RADAR TELEMETRY
        </div>
      </div>

      <div className="region-cards-grid">
        {REGIONS_DATA.map((region) => {
          const isActive = selectedRegion === region.id;
          return (
            <div
              key={region.id}
              className={`region-stat-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectRegion(isActive ? 'All' : region.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="region-name">{region.name.split(' (')[0]}</span>
                {region.breakingNews && (
                  <span style={{ fontSize: '0.65rem', background: 'rgba(255,42,109,0.2)', color: 'var(--accent-crimson)', padding: '1px 5px', borderRadius: '3px', fontWeight: '700' }}>
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="region-volume-bar">
                <div className="volume-fill" style={{ width: `${region.volumeScore}%` }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="region-active-count">{region.activeCount} Ingested Dossiers</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                  {region.volumeScore}% flow
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
