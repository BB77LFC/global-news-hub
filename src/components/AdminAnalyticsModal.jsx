import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Users,
  Eye,
  Activity,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Radio,
  LogOut,
  Clock,
  Cpu,
  Server,
  Download,
  Trash2,
  KeyRound,
  Zap,
  X
} from 'lucide-react';
import {
  loginAdminPin,
  fetchAdminMetrics,
  getSavedAdminToken,
  clearAdminToken,
  resetAdminAnalytics
} from '../services/telemetryClient';

export default function AdminAnalyticsModal({ isOpen, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [rememberSession, setRememberSession] = useState(true);

  // Check existing session
  useEffect(() => {
    if (isOpen) {
      const token = getSavedAdminToken();
      if (token) {
        setIsAuthenticated(true);
        loadMetrics();
      } else {
        setIsAuthenticated(false);
        setPinInput('');
        setPinError('');
      }
    }
  }, [isOpen]);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchAdminMetrics();
    if (res.success) {
      setMetrics(res);
      setIsAuthenticated(true);
    } else {
      if (res.error?.includes('PIN') || res.error?.includes('Unauthorized')) {
        setIsAuthenticated(false);
      }
    }
    setIsLoading(false);
  }, []);

  // Auto-refresh every 15s when authenticated & modal open
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !autoRefresh) return;
    const timer = setInterval(() => {
      loadMetrics();
    }, 15000);
    return () => clearInterval(timer);
  }, [isOpen, isAuthenticated, autoRefresh, loadMetrics]);

  // Handle PIN submission
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setIsLoading(true);
    setPinError('');
    const res = await loginAdminPin(pinInput);
    if (res.success) {
      setIsAuthenticated(true);
      await loadMetrics();
    } else {
      setPinError(res.error || 'Authentication denied. Invalid access PIN.');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    setMetrics(null);
    setPinInput('');
  };

  const handleResetData = async () => {
    if (window.confirm('Clear all visitor analytics and event logs?')) {
      await resetAdminAnalytics();
      await loadMetrics();
    }
  };

  const handleExportJSON = () => {
    if (!metrics) return;
    const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnipulse-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="dossier-modal admin-analytics-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1080px',
          width: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-glow, rgba(0, 229, 255, 0.25))',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 229, 255, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header-bar"
          style={{
            padding: '1.1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.95)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isAuthenticated ? 'rgba(5, 241, 144, 0.15)' : 'rgba(255, 42, 109, 0.15)',
                border: `1px solid ${isAuthenticated ? 'var(--accent-emerald, #05f190)' : 'var(--accent-crimson, #ff2a6d)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAuthenticated ? 'var(--accent-emerald, #05f190)' : 'var(--accent-crimson, #ff2a6d)'
              }}
            >
              {isAuthenticated ? <Unlock size={18} /> : <Lock size={18} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                  OmniPulse Owner Telemetry & Analytics
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: isAuthenticated ? 'rgba(5, 241, 144, 0.12)' : 'rgba(255, 42, 109, 0.12)',
                    color: isAuthenticated ? 'var(--accent-emerald, #05f190)' : 'var(--accent-crimson, #ff2a6d)',
                    border: `1px solid ${isAuthenticated ? 'rgba(5, 241, 144, 0.3)' : 'rgba(255, 42, 109, 0.3)'}`
                  }}
                >
                  {isAuthenticated ? 'CLASSIFIED • LEVEL 5' : 'AUTHENTICATION REQUIRED'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
                Private owner control plane • Real-time visitor metrics, traffic channels, & node health
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isAuthenticated && (
              <>
                <button
                  className="icon-btn"
                  onClick={loadMetrics}
                  disabled={isLoading}
                  title="Refresh Telemetry"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  className="icon-btn"
                  onClick={handleExportJSON}
                  title="Export Telemetry JSON"
                  style={{ padding: '6px 10px' }}
                >
                  <Download size={14} />
                </button>
                <button
                  className="icon-btn"
                  onClick={handleLogout}
                  title="Lock & Exit Terminal"
                  style={{ padding: '6px 10px', color: 'var(--accent-crimson, #ff2a6d)' }}
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
            <button
              className="icon-btn"
              onClick={onClose}
              style={{ padding: '6px 10px', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-primary, #090d16)' }}>
          {!isAuthenticated ? (
            /* PIN Unlock Form */
            <div
              style={{
                maxWidth: '420px',
                margin: '3rem auto',
                padding: '2rem',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 1.2rem',
                  borderRadius: '50%',
                  background: 'rgba(0, 229, 255, 0.1)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan, #00e5ff)'
                }}
              >
                <KeyRound size={26} />
              </div>

              <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>
                Security Clearance Required
              </h3>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
                Enter your private owner PIN to unlock the live analytics and traffic console.
              </p>

              <form onSubmit={handlePinSubmit}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <input
                    type="password"
                    placeholder="Enter Security PIN (Default: 7799)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    autoFocus
                    maxLength={16}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(9, 13, 22, 0.8)',
                      border: pinError ? '1px solid var(--accent-crimson, #ff2a6d)' : '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '1.05rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      textAlign: 'center',
                      letterSpacing: '0.25em',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {pinError && (
                    <div style={{ color: 'var(--accent-crimson, #ff2a6d)', fontSize: '0.78rem', marginTop: '0.5rem', textAlign: 'center' }}>
                      {pinError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00E5FF 0%, #0077FF 100%)',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Unlock size={16} />
                  <span>{isLoading ? 'Verifying...' : 'Unlock Telemetry Terminal'}</span>
                </button>
              </form>

              <div style={{ marginTop: '1.4rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.72rem', color: '#94a3b8' }}>
                💡 Default Master PIN: <strong style={{ color: 'var(--accent-cyan, #00e5ff)', fontFamily: 'var(--font-mono, monospace)' }}>7799</strong>
                <div style={{ marginTop: '4px', opacity: 0.8 }}>You can change this anytime via the <code>ADMIN_PIN</code> environment variable.</div>
              </div>
            </div>
          ) : (
            /* Authenticated Telemetry Dashboard */
            <div>
              {/* Top Banner & Quick Status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '12px',
                  background: 'rgba(0, 229, 255, 0.05)',
                  border: '1px solid rgba(0, 229, 255, 0.15)',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--accent-emerald, #05f190)',
                      boxShadow: '0 0 10px var(--accent-emerald, #05f190)',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono, monospace)', color: '#fff' }}>
                    LIVE TELEMETRY STREAMING • {metrics?.feedCount || 112} DISPATCHES INGESTED • {metrics?.totalSources || 26} WIRES ACTIVE
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    Auto-refresh (15s)
                  </label>
                  <button
                    onClick={handleResetData}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-crimson, #ff2a6d)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: 0.8
                    }}
                  >
                    <Trash2 size={12} /> Reset Data
                  </button>
                </div>
              </div>

              {/* KPI Stat Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                {/* Total Pageviews */}
                <div className="stat-card" style={statCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={statLabelStyle}>Total Pageviews</span>
                    <Eye size={18} color="var(--accent-cyan, #00e5ff)" />
                  </div>
                  <div style={statValueStyle}>{metrics?.overview?.totalPageviews || 0}</div>
                  <div style={statSubStyle}>Recorded across all sessions</div>
                </div>

                {/* Unique Visitors */}
                <div className="stat-card" style={statCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={statLabelStyle}>Unique Visitors</span>
                    <Users size={18} color="var(--accent-emerald, #05f190)" />
                  </div>
                  <div style={{ ...statValueStyle, color: 'var(--accent-emerald, #05f190)' }}>
                    {metrics?.overview?.uniqueVisitors || 0}
                  </div>
                  <div style={statSubStyle}>Distinct daily devices</div>
                </div>

                {/* Active Sessions */}
                <div className="stat-card" style={statCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={statLabelStyle}>Active Right Now</span>
                    <Zap size={18} color="#FFD700" />
                  </div>
                  <div style={{ ...statValueStyle, color: '#FFD700' }}>
                    {metrics?.overview?.activeSessionsNow || 1}
                  </div>
                  <div style={statSubStyle}>Active in last 15 minutes</div>
                </div>

                {/* Audio Briefings */}
                <div className="stat-card" style={statCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={statLabelStyle}>Audio Briefings</span>
                    <Radio size={18} color="#A855F7" />
                  </div>
                  <div style={{ ...statValueStyle, color: '#A855F7' }}>
                    {metrics?.overview?.audioBriefingsPlayed || 0}
                  </div>
                  <div style={statSubStyle}>AI voices synthesized</div>
                </div>

                {/* Node Health / Memory */}
                <div className="stat-card" style={statCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={statLabelStyle}>Server Uptime</span>
                    <Server size={18} color="var(--accent-cyan, #00e5ff)" />
                  </div>
                  <div style={{ ...statValueStyle, fontSize: '1.3rem' }}>
                    {formatUptime(metrics?.overview?.uptimeSeconds || 0)}
                  </div>
                  <div style={statSubStyle}>RAM: {metrics?.system?.heapUsedMb || 0}MB used</div>
                </div>
              </div>

              {/* Traffic Timeline Chart (12 hours) */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.2rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={18} color="var(--accent-cyan, #00e5ff)" />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>Traffic Volume (Rolling 12 Hours)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>
                    Hourly Dispatches Checked
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '12px',
                    height: '110px',
                    paddingTop: '10px'
                  }}
                >
                  {(metrics?.timeline || []).map((t, idx) => {
                    const max = Math.max(...(metrics?.timeline || []).map(x => x.views), 1);
                    const heightPct = Math.max(Math.round((t.views / max) * 100), 8);
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan, #00e5ff)', marginBottom: '4px' }}>
                          {t.views}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '36px',
                            height: `${heightPct}%`,
                            background: 'linear-gradient(180deg, #00E5FF 0%, rgba(0, 229, 255, 0.2) 100%)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.4s ease'
                          }}
                        />
                        <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
                          {t.hour}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dual Columns: Device Breakdown & Referrers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.2rem',
                  marginBottom: '1.5rem'
                }}
              >
                {/* Device Breakdown */}
                <div style={panelBoxStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Monitor size={16} color="var(--accent-cyan, #00e5ff)" />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>Device Breakdown</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <DeviceRow
                      icon={<Monitor size={14} />}
                      label="Desktop"
                      count={metrics?.devices?.desktop || 0}
                      total={metrics?.overview?.totalPageviews || 1}
                      color="#00E5FF"
                    />
                    <DeviceRow
                      icon={<Smartphone size={14} />}
                      label="Mobile"
                      count={metrics?.devices?.mobile || 0}
                      total={metrics?.overview?.totalPageviews || 1}
                      color="#05F190"
                    />
                    <DeviceRow
                      icon={<Tablet size={14} />}
                      label="Tablet"
                      count={metrics?.devices?.tablet || 0}
                      total={metrics?.overview?.totalPageviews || 1}
                      color="#FF2A6D"
                    />
                  </div>

                  <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Top Browsers:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(metrics?.browsers || {}).map(([b, cnt]) => (
                        <span
                          key={b}
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#cbd5e1'
                          }}
                        >
                          {b}: <strong>{cnt}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Traffic Referrers */}
                <div style={panelBoxStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Globe size={16} color="var(--accent-emerald, #05f190)" />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>Traffic Acquisition & Referrers</span>
                  </div>

                  {(metrics?.topReferrers || []).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {(metrics?.topReferrers || []).map((ref, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            fontSize: '0.8rem'
                          }}
                        >
                          <span style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono, monospace)' }}>
                            {ref.source || 'Direct'}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--accent-cyan, #00e5ff)' }}>
                            {ref.count} visits
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>
                      No external referrers recorded yet (most visits are Direct / PWA).
                    </div>
                  )}
                </div>
              </div>

              {/* Live Real-Time Event Log */}
              <div style={panelBoxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="#FFD700" />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>Live Intelligence Event Log</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Last 20 Real-Time Dispatches</span>
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(metrics?.recentEvents || []).map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 100px 1fr 70px',
                        gap: '8px',
                        alignItems: 'center',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        borderLeft: '2px solid var(--accent-cyan, #00e5ff)'
                      }}
                    >
                      <span style={{ color: '#64748b' }}>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      <span style={{ color: 'var(--accent-cyan, #00e5ff)', fontWeight: 600 }}>{ev.eventType}</span>
                      <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.metadata?.title || ev.path || 'Root'}
                      </span>
                      <span style={{ color: '#94a3b8', textTransform: 'uppercase' }}>{ev.device}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers & Inline Styles ─────────────────────────────────────────

function DeviceRow({ icon, label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', color: '#cbd5e1' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{icon} {label}</span>
        <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
      </div>
      <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

function formatUptime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

const statCardStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '1.1rem'
};

const statLabelStyle = {
  fontSize: '0.78rem',
  color: 'var(--text-muted, #94a3b8)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const statValueStyle = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#fff',
  fontFamily: 'var(--font-mono, monospace)',
  lineHeight: 1.1
};

const statSubStyle = {
  fontSize: '0.72rem',
  color: '#64748b',
  marginTop: '4px'
};

const panelBoxStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '1.2rem'
};
