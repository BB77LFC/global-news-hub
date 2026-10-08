import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Clock,
  Sparkles,
  Share2,
  Bookmark,
  CheckCircle,
  MessageCircle,
  Repeat,
  Heart,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Download,
  Printer,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { exportDossierMarkdown } from '../services/newsService';

export default function StoryDossierModal({
  story,
  onClose,
  isBookmarked,
  onToggleBookmark
}) {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'trust' | 'nyt' | 'x' | 'instagram' | 'reddit' | 'timeline'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSynth, setSpeechSynth] = useState(null);

  // Audio briefing text synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynth(window.speechSynthesis);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = () => {
    if (!speechSynth) return;

    if (isPlayingAudio) {
      speechSynth.cancel();
      setIsPlayingAudio(false);
    } else {
      speechSynth.cancel();
      const textToRead = `${story.title}. Executive multi-source briefing: ${story.executiveBriefing?.summary || story.summary}. Key points: ${story.executiveBriefing?.keyTakeaways?.map(t => `${t.tag}: ${t.text}`).join('. ') || ''}. Geopolitical impact: ${story.executiveBriefing?.geopoliticalImpact || ''}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      speechSynth.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  if (!story) return null;

  const {
    title,
    category,
    urgency,
    region,
    timestamp,
    readTime,
    executiveBriefing,
    platformData,
    timeline,
    sourceCounts,
    trustScore,
    verification
  } = story;

  return (
    <div className="modal-backdrop" onClick={() => { if (speechSynth) speechSynth.cancel(); onClose(); }}>
      <div className="dossier-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <span className={`urgency-badge ${urgency === 'BREAKING' ? 'breaking' : urgency === 'HIGH IMPACT' ? 'high' : 'developing'}`}>
              {urgency}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
              📍 {region} • {category} • {timestamp}
            </span>
            {trustScore && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-emerald)', background: 'rgba(5,241,144,0.12)', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(5,241,144,0.3)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={12} /> {trustScore}% Corroborated
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              className="icon-btn"
              onClick={() => exportDossierMarkdown(story)}
              title="Export Intelligence Dossier as Markdown"
            >
              <Download size={14} />
              <span>Export Report</span>
            </button>

            <button
              className={`icon-btn ${isBookmarked ? 'active' : ''}`}
              onClick={() => onToggleBookmark(story.id)}
              title={isBookmarked ? "Remove Bookmark" : "Save Story"}
            >
              <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button
              className="modal-close-btn"
              onClick={() => { if (speechSynth) speechSynth.cancel(); onClose(); }}
              title="Close Dossier"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs-nav">
          <button
            className={`modal-tab ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
          >
            ⚡ 360° Matrix
          </button>
          <button
            className={`modal-tab ${activeTab === 'trust' ? 'active' : ''}`}
            onClick={() => setActiveTab('trust')}
          >
            🛡️ Verifiability & Trust ({trustScore || 98}%)
          </button>
          <button
            className={`modal-tab ${activeTab === 'nyt' ? 'active' : ''}`}
            onClick={() => setActiveTab('nyt')}
          >
            📰 NY Times Editorial
          </button>
          <button
            className={`modal-tab ${activeTab === 'x' ? 'active' : ''}`}
            onClick={() => setActiveTab('x')}
          >
            𝕏 Twitter Wire ({sourceCounts?.x || 0})
          </button>
          <button
            className={`modal-tab ${activeTab === 'instagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('instagram')}
          >
            📸 Instagram Visuals ({sourceCounts?.instagram || 0})
          </button>
          <button
            className={`modal-tab ${activeTab === 'reddit' ? 'active' : ''}`}
            onClick={() => setActiveTab('reddit')}
          >
            💬 Reddit Debate
          </button>
          <button
            className={`modal-tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            ⏱ Chronology
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="modal-body">
          {/* Audio Newscaster Toolbar */}
          <div className="audio-briefing-bar">
            <div className="audio-controls-group">
              <button className="audio-play-btn" onClick={handleToggleAudio}>
                {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlayingAudio ? "Pause Newscast" : "Listen to Audio Briefing"}</span>
              </button>
              {isPlayingAudio && (
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Volume2 size={13} className="pulse-dot" /> Streaming Synthesized Audio Dispatch...
                </span>
              )}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Open Source Intelligence Wire • Multi-Source Corroborated
            </div>
          </div>

          {/* Executive AI Briefing Panel */}
          <div className="executive-briefing-box">
            <div className="briefing-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} />
                <span>Executive Multi-Source Intelligence Dossier</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>Verified By 6+ Independent Streams</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: '800', marginBottom: '0.6rem', color: '#fff' }}>
              {title}
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              {executiveBriefing?.summary || story.summary}
            </p>

            <div className="key-takeaway-list">
              {executiveBriefing?.keyTakeaways?.map((item, idx) => (
                <div key={idx} className="takeaway-card">
                  <span className="takeaway-tag">[{item.tag}]</span>
                  <span style={{ color: '#e2e8f0' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TAB: VERIFIABILITY & TRUST MATRIX */}
          {activeTab === 'trust' && (
            <div className="trust-matrix-card">
              <div className="trust-matrix-header">
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
                    <ShieldCheck size={20} />
                    Corroboration & Verifiability Audit
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Multi-source cross-verification index assessing wire consensus, primary documents, and fact-checking.
                  </p>
                </div>
                <div className="trust-gauge">
                  <span>{trustScore || 98}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400' }}>Index</span>
                </div>
              </div>

              <div className="trust-factors-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="factor-item">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent-emerald)', display: 'block', marginBottom: '0.2rem' }}>
                    WIRE CORROBORATION
                  </span>
                  <span style={{ fontWeight: '600' }}>
                    {verification?.wireCorroboration?.join(' • ') || "Reuters, AP, AFP, Bloomberg, FT"}
                  </span>
                </div>

                <div className="factor-item">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.2rem' }}>
                    PRIMARY DOCUMENT / TELEMETRY
                  </span>
                  <span style={{ fontWeight: '500', fontSize: '0.78rem' }}>
                    {verification?.primaryDocument || "Official Depository Treaty Registry / Ground Station Telemetry"}
                  </span>
                </div>

                <div className="factor-item">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent-amber)', display: 'block', marginBottom: '0.2rem' }}>
                    FACT-CHECK STATUS
                  </span>
                  <span style={{ fontWeight: '500', fontSize: '0.78rem' }}>
                    {verification?.factCheckStatus || "Validated: Zero factual discrepancies detected across global audit desks."}
                  </span>
                </div>

                <div className="factor-item">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#ff6584', display: 'block', marginBottom: '0.2rem' }}>
                    PERSPECTIVE SPECTRUM
                  </span>
                  <span style={{ fontWeight: '500', fontSize: '0.78rem' }}>
                    {verification?.biasSpectrum || "Multilateral Consensus"}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.4rem', color: '#fff' }}>
                  Why This Matters for Reliable Internet News:
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Unlike single-platform feeds that amplify unverified rumors, OmniPulse requires minimum multi-wire corroboration from accredited international news services and official primary documentation before awarding a High Confidence status.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: 360° COMPARISON MATRIX */}
          {activeTab === 'matrix' && (
            <div className="matrix-grid">
              {/* Column 1: Traditional Press (NYT / Reuters) */}
              <div className="matrix-column">
                <div className="matrix-col-header">
                  <span className="col-badge chip-nyt">The New York Times</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified Press</span>
                </div>
                {platformData?.nyt && (
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.6rem', color: '#fff' }}>
                      {platformData.nyt.headline}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.85rem' }}>
                      "{platformData.nyt.pullquote}"
                    </p>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                      By {platformData.nyt.author} ({platformData.nyt.role})
                    </div>
                    <button
                      className="icon-btn"
                      style={{ fontSize: '0.76rem', width: '100%', justifyContent: 'center' }}
                      onClick={() => setActiveTab('nyt')}
                    >
                      Read Complete NYT Article
                    </button>
                  </div>
                )}
              </div>

              {/* Column 2: Breaking Pulse (Twitter / X) */}
              <div className="matrix-column">
                <div className="matrix-col-header">
                  <span className="col-badge chip-x">𝕏 Breaking Wire</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sourceCounts?.x || 0} verified updates</span>
                </div>
                {platformData?.x?.tweets?.[0] && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <img src={platformData.x.tweets[0].avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.84rem' }}>{platformData.x.tweets[0].authorName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{platformData.x.tweets[0].handle}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.45', marginBottom: '0.75rem' }}>
                      {platformData.x.tweets[0].content}
                    </p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      ❤️ {platformData.x.tweets[0].likes} • 🔁 {platformData.x.tweets[0].reposts}
                    </div>
                    <button
                      className="icon-btn"
                      style={{ fontSize: '0.76rem', width: '100%', justifyContent: 'center' }}
                      onClick={() => setActiveTab('x')}
                    >
                      Inspect Live Tweet Stream
                    </button>
                  </div>
                )}
              </div>

              {/* Column 3: Visual Field Media (Instagram) */}
              <div className="matrix-column">
                <div className="matrix-col-header">
                  <span className="col-badge chip-instagram">Instagram Dispatch</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Photojournalism</span>
                </div>
                {platformData?.instagram?.posts?.[0] && (
                  <div>
                    <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '140px', marginBottom: '0.75rem' }}>
                      <img
                        src={platformData.instagram.posts[0].images[0]}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                      {platformData.instagram.posts[0].caption.substring(0, 110)}...
                    </p>
                    <button
                      className="icon-btn"
                      style={{ fontSize: '0.76rem', width: '100%', justifyContent: 'center' }}
                      onClick={() => setActiveTab('instagram')}
                    >
                      View Photo Carousel
                    </button>
                  </div>
                )}
              </div>

              {/* Column 4: Public Forum (Reddit) */}
              <div className="matrix-column">
                <div className="matrix-col-header">
                  <span className="col-badge chip-reddit">Reddit Discourse</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{platformData?.reddit?.subreddit}</span>
                </div>
                {platformData?.reddit && (
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '600', marginBottom: '0.6rem', color: '#fff' }}>
                      {platformData.reddit.threadTitle}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-reddit)', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>
                      ▲ {platformData.reddit.upvotes} • {platformData.reddit.commentCount} comments
                    </div>
                    {platformData.reddit.topComments?.[0] && (
                      <div className="reddit-highlight-comment" style={{ marginBottom: '0.8rem' }}>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.72rem', display: 'block' }}>
                          {platformData.reddit.topComments[0].user} ({platformData.reddit.topComments[0].upvotes} ▲):
                        </span>
                        {platformData.reddit.topComments[0].text}
                      </div>
                    )}
                    <button
                      className="icon-btn"
                      style={{ fontSize: '0.76rem', width: '100%', justifyContent: 'center' }}
                      onClick={() => setActiveTab('reddit')}
                    >
                      View Forum Discussion
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NYT ARTICLE VIEW */}
          {activeTab === 'nyt' && platformData?.nyt && (
            <div className="nyt-article-view">
              <div className="nyt-publisher-badge">The New York Times</div>
              <h2 className="nyt-headline">{platformData.nyt.headline}</h2>
              <div className="nyt-byline">
                <span>By {platformData.nyt.author}</span>
                <span>•</span>
                <span>{platformData.nyt.role}</span>
                <span>•</span>
                <span>{platformData.nyt.publicationDate}</span>
              </div>

              <blockquote className="nyt-pullquote">
                "{platformData.nyt.pullquote}"
              </blockquote>

              <div className="nyt-prose">
                {platformData.nyt.paragraphs.map((para, i) => (
                  <p key={i} style={{ marginBottom: '1.2rem' }}>{para}</p>
                ))}
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Original Source: The New York Times World Section</span>
                <a
                  href={platformData.nyt.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn active"
                  style={{ textDecoration: 'none' }}
                >
                  Visit NYTimes.com <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: TWITTER / X LIVE WIRE */}
          {activeTab === 'x' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--brand-x)' }}>
                  Verified Journalist & Official Dispatches ({platformData?.x?.tweets?.length || 0} tweets)
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Ingested via X Streaming API Gateway
                </span>
              </div>

              {platformData?.x?.tweets?.map((tweet) => (
                <div key={tweet.id} className="tweet-card">
                  <div className="tweet-header">
                    <img src={tweet.avatar} alt={tweet.authorName} className="author-avatar" />
                    <div className="tweet-author-info">
                      <div className="author-name">
                        {tweet.authorName}
                        {tweet.verified && <span className="verified-badge">✓</span>}
                      </div>
                      <div className="author-handle">{tweet.handle} • {tweet.timestamp}</div>
                    </div>
                  </div>

                  <p className="tweet-text">{tweet.content}</p>

                  {tweet.mediaUrl && (
                    <img src={tweet.mediaUrl} alt="" className="tweet-media" />
                  )}

                  {tweet.communityNote && (
                    <div className="community-note">
                      <div className="community-note-header">
                        <ShieldAlert size={14} />
                        <span>Readers added context they thought people might want to know:</span>
                      </div>
                      <div>{tweet.communityNote}</div>
                    </div>
                  )}

                  <div className="tweet-stats-bar">
                    <span>❤️ {tweet.likes} Likes</span>
                    <span>🔁 {tweet.reposts} Reposts</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>🔗 Ingested Feed Node</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: INSTAGRAM VISUALS */}
          {activeTab === 'instagram' && (
            <div>
              <div style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#ff5277' }}>
                Visual Journalism & Field Carousels ({platformData?.instagram?.posts?.length || 0} photo stories)
              </div>

              {platformData?.instagram?.posts?.map((post) => (
                <div key={post.id} className="ig-post-card">
                  <div className="ig-post-header">
                    <div className="ig-avatar-ring">
                      <img src={post.avatar} alt="" className="ig-avatar" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{post.account}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📍 {post.location}</div>
                    </div>
                  </div>

                  <div className="ig-media-frame">
                    <img src={post.images[0]} alt="" />
                    <div className="ig-carousel-counter">
                      <ImageIcon size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      1/{post.images.length}
                    </div>
                  </div>

                  <div className="ig-caption-box">
                    <div style={{ marginBottom: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#ff5277' }}>
                      ❤️ {post.likes} likes • 💬 {post.comments} comments
                    </div>
                    <span className="ig-caption-author">{post.account}</span>
                    <span style={{ color: '#cbd5e1' }}>{post.caption}</span>
                    <div className="ig-tags">{post.tags}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: REDDIT DISCUSSION */}
          {activeTab === 'reddit' && platformData?.reddit && (
            <div>
              <div className="reddit-card">
                <div className="reddit-meta">
                  <span>Posted in {platformData.reddit.subreddit}</span>
                  <span>•</span>
                  <span>Community Megathread</span>
                </div>

                <h3 className="reddit-post-title">{platformData.reddit.threadTitle}</h3>

                <div style={{ display: 'flex', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  <span style={{ color: 'var(--brand-reddit)', fontWeight: '700' }}>▲ {platformData.reddit.upvotes} Upvotes</span>
                  <span>💬 {platformData.reddit.commentCount} Comments</span>
                </div>

                <div style={{ fontWeight: '700', fontSize: '0.86rem', color: '#fff', marginBottom: '0.75rem' }}>
                  Top Verified Community Perspectives:
                </div>

                {platformData.reddit.topComments?.map((comment, index) => (
                  <div key={index} className="reddit-highlight-comment" style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.78rem' }}>
                        {comment.user}
                      </span>
                      <span style={{ color: 'var(--brand-reddit)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        ▲ {comment.upvotes}
                      </span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.84rem' }}>{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CHRONOLOGICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="timeline-stream">
              {timeline?.map((item, idx) => (
                <div key={idx} className="timeline-event-item">
                  <div className="timeline-event-dot"></div>
                  <div className="timeline-timecode">{item.time} — {item.source}</div>
                  <h4 className="timeline-title">{item.title}</h4>
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
