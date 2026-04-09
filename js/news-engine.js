/**
 * TENET5 Canadian News Intelligence Engine
 *
 * RSS feed aggregation from major Canadian news sources via rss2json.com CORS proxy.
 * Categorization, deduplication, caching, and intelligence report formatting.
 *
 * Exported API (ES module):
 *   fetchAllNews()                  — fetch, parse, dedupe, sort, cache
 *   getCachedNews()                 — return cache or null
 *   categorizeArticle(title, desc)  — keyword classification
 */

// ── RSS Sources ──────────────────────────────────────────────────
const RSS_FEEDS = [
  {
    id: 'cbc-politics',
    name: 'CBC Politics',
    source: 'CBC',
    url: 'https://www.cbc.ca/webfeed/rss/rss-politics'
  },
  {
    id: 'cbc-canada',
    name: 'CBC Canada',
    source: 'CBC',
    url: 'https://www.cbc.ca/webfeed/rss/rss-canada'
  },
  {
    id: 'global-canada',
    name: 'Global News Canada',
    source: 'Global',
    url: 'https://globalnews.ca/canada/feed/'
  },
  {
    id: 'ctv-top',
    name: 'CTV Top Stories',
    source: 'CTV',
    url: 'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009'
  }
];

// ── rss2json.com CORS proxy ──────────────────────────────────────
const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';

// ── Cache Configuration ──────────────────────────────────────────
const CACHE_KEY = 'tenet5_news_v2';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ── Category Keywords ────────────────────────────────────────────
const CATEGORY_RULES = {
  'Politics': [
    'parliament', 'liberal', 'conservative', 'ndp', 'bloc', 'trudeau',
    'poilievre', 'carney', 'singh', 'election', 'ballot', 'campaign',
    'caucus', 'senate', 'commons', 'minister', 'prime minister',
    'political', 'partisan', 'legislation', 'bill c-', 'bill s-',
    'governor general', 'cabinet', 'opposition', 'riding', 'mp ',
    'member of parliament', 'house of commons', 'throne speech',
    'prorogation', 'filibuster', 'whip', 'backbencher'
  ],
  'Defence': [
    'military', 'defence', 'defense', 'armed forces', 'caf',
    'nato', 'norad', 'frigate', 'submarine', 'fighter jet',
    'procurement', 'dnd', 'national defence', 'troops', 'deploy',
    'warfare', 'army', 'navy', 'air force', 'special forces',
    'peacekeeping', 'veteran', 'soldier', 'battalion', 'regiment'
  ],
  'Justice': [
    'court', 'judge', 'trial', 'prosecution', 'lawsuit', 'rcmp',
    'police', 'criminal', 'sentence', 'verdict', 'supreme court',
    'charter', 'rights', 'justice', 'attorney general', 'solicitor',
    'investigation', 'fraud', 'corruption', 'inquiry', 'commissioner',
    'csis', 'intelligence', 'warrant', 'bail', 'parole'
  ],
  'Foreign Affairs': [
    'foreign', 'diplomatic', 'embassy', 'ambassador', 'treaty',
    'sanctions', 'trade deal', 'tariff', 'g7', 'g20', 'united nations',
    'un ', 'china', 'russia', 'ukraine', 'israel', 'gaza', 'iran',
    'bilateral', 'multilateral', 'sovereignty', 'arctic', 'border',
    'immigration', 'refugee', 'asylum', 'deportation', 'visa'
  ],
  'Indigenous': [
    'indigenous', 'first nations', 'inuit', 'metis', 'mtis',
    'reconciliation', 'residential school', 'treaty', 'reserve',
    'band council', 'afn', 'assembly of first nations', 'undrip',
    'murdered missing', 'mmiwg', 'land claim', 'self-governance',
    'drinking water', 'boil water advisory'
  ],
  'Health/MAID': [
    'maid', 'medical assistance in dying', 'euthanasia', 'assisted dying',
    'health', 'hospital', 'healthcare', 'doctor', 'nurse', 'pandemic',
    'vaccine', 'public health', 'mental health', 'opioid', 'overdose',
    'fentanyl', 'drug', 'pharmacare', 'dental care', 'long-term care',
    'disability', 'patient', 'diagnosis', 'surgery', 'wait time'
  ],
  'Economy': [
    'economy', 'economic', 'inflation', 'gdp', 'bank of canada',
    'interest rate', 'recession', 'trade', 'tariff', 'budget',
    'deficit', 'surplus', 'tax', 'revenue', 'employment',
    'unemployment', 'jobs', 'housing', 'mortgage', 'real estate',
    'rent', 'affordability', 'cost of living', 'grocery', 'gas price',
    'oil', 'energy', 'pipeline', 'stock market', 'dollar'
  ]
};

// ── Categorize an article by title + description keywords ────────
export function categorizeArticle(title, description) {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return category;
      }
    }
  }
  return 'Other';
}

// ── Strip HTML tags from a string ────────────────────────────────
function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// ── Normalize title for deduplication ────────────────────────────
function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

// ── Fetch a single RSS feed via rss2json.com ─────────────────────
async function fetchFeed(feed) {
  const url = RSS2JSON_BASE + encodeURIComponent(feed.url);

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      console.warn('[NewsEngine] HTTP ' + response.status + ' for ' + feed.name);
      return [];
    }

    const data = await response.json();

    if (data.status !== 'ok' || !Array.isArray(data.items)) {
      console.warn('[NewsEngine] Bad response from ' + feed.name);
      return [];
    }

    return data.items.map(function (item) {
      const desc = stripHtml(item.description || '');
      const title = (item.title || '').trim();
      const thumbnail = item.thumbnail || item.enclosure?.link || '';

      return {
        title: title,
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.source,
        description: desc,
        thumbnail: thumbnail,
        category: categorizeArticle(title, desc)
      };
    });
  } catch (err) {
    console.warn('[NewsEngine] Failed to fetch ' + feed.name + ':', err.message);
    return [];
  }
}

// ── Deduplicate articles by normalized title similarity ──────────
function deduplicateArticles(articles) {
  const seen = new Set();
  const unique = [];

  for (const article of articles) {
    const key = normalizeTitle(article.title);
    if (key.length < 10) {
      unique.push(article);
      continue;
    }
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(article);
    }
  }

  return unique;
}

// ── Sort articles by publication date (newest first) ─────────────
function sortByDate(articles) {
  return articles.sort(function (a, b) {
    return new Date(b.pubDate) - new Date(a.pubDate);
  });
}

// ── Cache: read ──────────────────────────────────────────────────
export function getCachedNews() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const age = Date.now() - (cached.timestamp || 0);

    if (age > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cached.articles || null;
  } catch (e) {
    return null;
  }
}

// ── Cache: write ─────────────────────────────────────────────────
function setCachedNews(articles) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      articles: articles,
      timestamp: Date.now()
    }));
  } catch (e) {
    // localStorage full or disabled — silent
  }
}

// ── Main entry point: fetch all feeds, dedupe, sort, cache ───────
export async function fetchAllNews() {
  // Return cache if valid
  const cached = getCachedNews();
  if (cached && cached.length > 0) {
    return cached;
  }

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(
    RSS_FEEDS.map(function (feed) {
      return fetchFeed(feed);
    })
  );

  // Flatten successful results
  let allArticles = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allArticles = allArticles.concat(result.value);
    }
  }

  // Deduplicate and sort
  allArticles = deduplicateArticles(allArticles);
  allArticles = sortByDate(allArticles);

  // Cache results
  if (allArticles.length > 0) {
    setCachedNews(allArticles);
  }

  return allArticles;
}
