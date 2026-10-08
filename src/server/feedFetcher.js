/**
 * OmniPulse RSS Aggregation Server (Enhanced)
 * Fetches 20+ real live feeds from global news sources
 */

const FEED_SOURCES = [
  // === TIER 1 WIRE SERVICES ===
  {
    sourceName: "Reuters World",
    sourceId: "reuters",
    category: "Geopolitics",
    region: "Global",
    url: "https://feeds.reuters.com/reuters/topNews",
    brandClass: "chip-reuters",
    tier: 1
  },
  {
    sourceName: "Associated Press Top News",
    sourceId: "ap",
    category: "Geopolitics",
    region: "Global",
    url: "https://apnews.com/rss/topnews",
    brandClass: "chip-ap",
    tier: 1
  },
  // === TIER 1 GLOBAL PRESS ===
  {
    sourceName: "The New York Times",
    sourceId: "nyt",
    category: "Geopolitics",
    region: "North America",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    brandClass: "chip-nyt",
    tier: 1
  },
  {
    sourceName: "NY Times Technology",
    sourceId: "nyt",
    category: "Tech & AI",
    region: "North America",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    brandClass: "chip-nyt",
    tier: 1
  },
  {
    sourceName: "NY Times Science",
    sourceId: "nyt",
    category: "Health & Science",
    region: "Global",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
    brandClass: "chip-nyt",
    tier: 1
  },
  {
    sourceName: "NY Times Climate",
    sourceId: "nyt",
    category: "Climate & Energy",
    region: "Global",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml",
    brandClass: "chip-nyt",
    tier: 1
  },
  {
    sourceName: "BBC World News",
    sourceId: "bbc",
    category: "Geopolitics",
    region: "Europe",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    brandClass: "chip-bbc",
    tier: 1
  },
  {
    sourceName: "BBC Technology",
    sourceId: "bbc",
    category: "Tech & AI",
    region: "Europe",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    brandClass: "chip-bbc",
    tier: 1
  },
  {
    sourceName: "BBC Science",
    sourceId: "bbc",
    category: "Health & Science",
    region: "Europe",
    url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    brandClass: "chip-bbc",
    tier: 1
  },
  // === TIER 2 GLOBAL VOICES ===
  {
    sourceName: "The Guardian World",
    sourceId: "guardian",
    category: "Geopolitics",
    region: "Europe",
    url: "https://www.theguardian.com/world/rss",
    brandClass: "chip-guardian",
    tier: 2
  },
  {
    sourceName: "The Guardian Tech",
    sourceId: "guardian",
    category: "Tech & AI",
    region: "Europe",
    url: "https://www.theguardian.com/uk/technology/rss",
    brandClass: "chip-guardian",
    tier: 2
  },
  {
    sourceName: "The Guardian Environment",
    sourceId: "guardian",
    category: "Climate & Energy",
    region: "Europe",
    url: "https://www.theguardian.com/environment/rss",
    brandClass: "chip-guardian",
    tier: 2
  },
  {
    sourceName: "Al Jazeera English",
    sourceId: "aljazeera",
    category: "Geopolitics",
    region: "Middle East",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    brandClass: "chip-aljazeera",
    tier: 2
  },
  {
    sourceName: "Deutsche Welle Global",
    sourceId: "dw",
    category: "Geopolitics",
    region: "Europe",
    url: "https://rss.dw.com/rss/rss-en-all",
    brandClass: "chip-dw",
    tier: 2
  },
  {
    sourceName: "France 24",
    sourceId: "france24",
    category: "Geopolitics",
    region: "Europe",
    url: "https://www.france24.com/en/rss",
    brandClass: "chip-france24",
    tier: 2
  },
  {
    sourceName: "South China Morning Post",
    sourceId: "scmp",
    category: "Geopolitics",
    region: "Asia-Pacific",
    url: "https://www.scmp.com/rss/91/feed",
    brandClass: "chip-scmp",
    tier: 2
  },
  // === FINANCE & MARKETS ===
  {
    sourceName: "Financial Times",
    sourceId: "ft",
    category: "Markets & Economy",
    region: "Global",
    url: "https://www.ft.com/rss/home",
    brandClass: "chip-ft",
    tier: 2
  },
  {
    sourceName: "The Economist",
    sourceId: "economist",
    category: "Markets & Economy",
    region: "Global",
    url: "https://www.economist.com/the-world-this-week/rss.xml",
    brandClass: "chip-economist",
    tier: 2
  },
  // === SCIENCE & TECH DEEP DIVE ===
  {
    sourceName: "Ars Technica",
    sourceId: "arstechnica",
    category: "Tech & AI",
    region: "North America",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    brandClass: "chip-arstechnica",
    tier: 2
  },
  {
    sourceName: "MIT Technology Review",
    sourceId: "mit",
    category: "Tech & AI",
    region: "North America",
    url: "https://www.technologyreview.com/feed/",
    brandClass: "chip-mit",
    tier: 2
  },
  {
    sourceName: "NASA News",
    sourceId: "nasa",
    category: "Space",
    region: "Global",
    url: "https://www.nasa.gov/news-release/feed/",
    brandClass: "chip-nasa",
    tier: 2
  },
  {
    sourceName: "Space.com",
    sourceId: "spacedotcom",
    category: "Space",
    region: "Global",
    url: "https://www.space.com/feeds/all",
    brandClass: "chip-spacedotcom",
    tier: 2
  },
  // === COMMUNITY SOCIAL WIRE ===
  {
    sourceName: "Reddit r/worldnews",
    sourceId: "reddit",
    category: "Geopolitics",
    region: "Global",
    url: "https://www.reddit.com/r/worldnews/hot.json?limit=8",
    brandClass: "chip-reddit",
    tier: 3,
    isJson: true,
    jsonParser: "reddit"
  },
  {
    sourceName: "Reddit r/technology",
    sourceId: "reddit",
    category: "Tech & AI",
    region: "Global",
    url: "https://www.reddit.com/r/technology/hot.json?limit=6",
    brandClass: "chip-reddit",
    tier: 3,
    isJson: true,
    jsonParser: "reddit"
  },
  {
    sourceName: "Reddit r/science",
    sourceId: "reddit",
    category: "Health & Science",
    region: "Global",
    url: "https://www.reddit.com/r/science/hot.json?limit=6",
    brandClass: "chip-reddit",
    tier: 3,
    isJson: true,
    jsonParser: "reddit"
  },
  {
    sourceName: "Reddit r/space",
    sourceId: "reddit",
    category: "Space",
    region: "Global",
    url: "https://www.reddit.com/r/space/hot.json?limit=6",
    brandClass: "chip-reddit",
    tier: 3,
    isJson: true,
    jsonParser: "reddit"
  }
];

const IMAGE_FALLBACKS = {
  "Geopolitics": [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
  ],
  "Tech & AI": [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
  ],
  "Health & Science": [
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80"
  ],
  "Climate & Energy": [
    "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80"
  ],
  "Space": [
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80"
  ],
  "Markets & Economy": [
    "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"
  ]
};

import { XMLParser } from 'fast-xml-parser';
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata"
});

const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'OmniPulseGlobalWire/2.0 (NewsIntelligenceHub; omnipulse.global)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/json, */*',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const formatTimeAgo = (date) => {
  const diffMs = Date.now() - (date instanceof Date ? date.getTime() : new Date(date).getTime());
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (isNaN(diffMin) || diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const getFallbackImage = (category) => {
  const list = IMAGE_FALLBACKS[category] || IMAGE_FALLBACKS["Geopolitics"];
  return list[Math.floor(Math.random() * list.length)];
};

const stripHtml = (html = '') => html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();

const extractImageFromItem = (item) => {
  // Try various RSS image patterns
  if (item['media:content']?.['@_url']) return item['media:content']['@_url'];
  if (item['media:thumbnail']?.['@_url']) return item['media:thumbnail']['@_url'];
  if (item.enclosure?.['@_url']) return item.enclosure['@_url'];
  if (item['media:content']?.['@_medium'] === 'image') return item['media:content']['@_url'];
  // Check description for an image
  const descStr = typeof item.description === 'string' ? item.description 
    : (item.description?.__cdata || item.description?.['#text'] || '');
  const imgMatch = descStr.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch) return imgMatch[1];
  return null;
};

const parseRedditJson = (json, feed) => {
  const posts = json?.data?.children || [];
  return posts
    .filter(p => !p.data.stickied && p.data.title)
    .map((p, idx) => {
      const d = p.data;
      const thumbnail = d.thumbnail && d.thumbnail.startsWith('http') ? d.thumbnail : null;
      const preview = d.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&');
      return {
        id: `live-reddit-${d.id || idx}-${Date.now()}`,
        title: d.title,
        summary: d.selftext ? d.selftext.substring(0, 300) : `${d.num_comments} comments • ${d.score} upvotes • Source: ${d.domain}`,
        category: feed.category,
        sourceName: feed.sourceName,
        sourceId: "reddit",
        brandClass: "chip-reddit",
        url: `https://reddit.com${d.permalink}`,
        publishedAt: new Date(d.created_utc * 1000).toISOString(),
        timeAgo: formatTimeAgo(new Date(d.created_utc * 1000)),
        imageUrl: preview || thumbnail || getFallbackImage(feed.category),
        isLiveWire: true,
        region: feed.region || "Global",
        redditStats: { upvotes: d.score, comments: d.num_comments, subreddit: d.subreddit_name_prefixed },
        trustScore: 82,
        corroboration: "Community Aggregated & Moderated"
      };
    });
};

const parseRssFeed = (xmlText, feed) => {
  let parsed;
  try {
    parsed = xmlParser.parse(xmlText);
  } catch {
    return [];
  }
  const channel = parsed?.rss?.channel || parsed?.feed;
  if (!channel) return [];
  const items = channel.item || channel.entry || [];
  const list = Array.isArray(items) ? items : [items];

  return list.slice(0, 7).filter(item => item.title).map((item, idx) => {
    const title = typeof item.title === 'object' ? (item.title.__cdata || item.title['#text'] || '') : (item.title || '');
    const description = stripHtml(
      typeof item.description === 'object' 
        ? (item.description.__cdata || item.description['#text'] || '') 
        : (item.description || item.summary || '')
    );
    const link = typeof item.link === 'object' ? (item.link?.['@_href'] || item.link?.['#text'] || '') : (item.link || '');
    const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();

    return {
      id: `live-${feed.sourceId}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      summary: description ? description.substring(0, 280) : "Developing report from live international wire dispatch.",
      category: feed.category,
      sourceName: feed.sourceName,
      sourceId: feed.sourceId,
      brandClass: feed.brandClass,
      url: link,
      publishedAt: pubDate,
      timeAgo: formatTimeAgo(new Date(pubDate)),
      imageUrl: extractImageFromItem(item) || getFallbackImage(feed.category),
      isLiveWire: true,
      region: feed.region || "Global",
      trustScore: feed.tier === 1 ? 97 : feed.tier === 2 ? 92 : 85,
      corroboration: feed.tier === 1 ? "Tier-1 International Press Wire" : "Verified International Press"
    };
  });
};

export async function fetchLiveRssFeeds() {
  const results = [];

  const promises = FEED_SOURCES.map(async (feed) => {
    try {
      if (feed.isJson && feed.jsonParser === 'reddit') {
        const res = await fetchWithTimeout(feed.url, {
          headers: { 'User-Agent': 'OmniPulseNews/2.0' }
        });
        if (!res.ok) return [];
        const json = await res.json();
        return parseRedditJson(json, feed);
      } else {
        const res = await fetchWithTimeout(feed.url);
        if (!res.ok) return [];
        const xmlText = await res.text();
        return parseRssFeed(xmlText, feed);
      }
    } catch (err) {
      console.warn(`⚠️  Feed failed [${feed.sourceName}]: ${err.message}`);
      return [];
    }
  });

  const settled = await Promise.allSettled(promises);
  settled.forEach(result => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      results.push(...result.value);
    }
  });

  // Sort by publication date, newest first
  results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  console.log(`📡 OmniPulse Live Wire: Ingested ${results.length} dispatches from ${FEED_SOURCES.length} sources`);
  return results;
}

export { FEED_SOURCES };
