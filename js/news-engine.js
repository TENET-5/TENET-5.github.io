/**
 * TENET5 News Intelligence Engine
 * Renders a premium editorial dashboard from cached headlines with local framing analysis.
 */

const RSS_FEEDS = [
  { name: 'CBC Politics', url: 'https://www.cbc.ca/cmlink/rss-politics' },
  { name: 'CBC Canada', url: 'https://www.cbc.ca/cmlink/rss-canada' },
  { name: 'CTV Canada', url: 'https://www.ctvnews.ca/rss/ctvnews-ca-canada-public-rss-1.822284' },
  { name: 'Global News CA', url: 'https://globalnews.ca/canada/feed/' }
];

const TOPIC_RULES = [
  { label: 'Government Power & Majority Control', keywords: ['carney', 'majority', 'byelection', 'parliament', 'liberal', 'floor'] },
  { label: 'Ethics & Oversight', keywords: ['ethics', 'conflict', 'watchdog', 'oversight', 'breach', 'hiring'] },
  { label: 'Affordability & Tax Messaging', keywords: ['tax', 'fuel', 'diesel', 'gas', 'affordability', 'cost'] },
  { label: 'Security & Foreign Policy', keywords: ['china', 'arctic', 'ukraine', 'nato', 'lebanon', 'defence'] }
];

let globalHeadlines = [];
let globalAnalysis = null;

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function stampFor(item) {
  if (item.when) return new Date(item.when * 1000).toLocaleString();
  if (item.date) {
    const parsed = new Date(item.date);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();
  }
  return 'Recent';
}

function pickTopic(title = '') {
  const lowered = title.toLowerCase();
  const hit = TOPIC_RULES.find(rule => rule.keywords.some(keyword => lowered.includes(keyword)));
  return hit ? hit.label : 'Institutional Accountability';
}

function buildAnalysis(headlines) {
  const grouped = new Map();
  const sourceCounts = new Map();

  headlines.forEach(item => {
    const topic = pickTopic(item.title || '');
    if (!grouped.has(topic)) grouped.set(topic, []);
    grouped.get(topic).push(item);
    sourceCounts.set(item.source, (sourceCounts.get(item.source) || 0) + 1);
  });

  const clusters = [...grouped.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 4)
    .map(([topic, items]) => {
      const sources = [...new Set(items.map(item => item.source))];
      const angle = sources.length > 1 ? 'Cross-source convergence' : 'Single-source emphasis';
      const summary = `${items.length} linked stories are centering ${topic.toLowerCase()}, with ${sources.join(', ')} shaping the public frame.`;
      return { topic, angle, summary, items: items.slice(0, 4) };
    });

  const fullText = headlines.map(item => (item.title || '').toLowerCase()).join(' ');
  const signals = [
    {
      label: 'Mandate language',
      active: /majority|sweep|clinches|phase|solidify/.test(fullText),
      note: 'Several outlets describe the same political shift as momentum or inevitability, which can reduce scrutiny.'
    },
    {
      label: 'Softened policy framing',
      active: /temporarily|affordability|support|reassurance|unity/.test(fullText),
      note: 'Consumer-friendly wording can make policy trade-offs feel less contested than they are.'
    },
    {
      label: 'Direct ethics wording',
      active: /ethics|conflict|watchdog|breach/.test(fullText),
      note: 'Where outlets use explicit oversight language, readers get a clearer accountability lens.'
    }
  ].filter(item => item.active);

  const sources = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return { clusters, signals, sources };
}

function updateStats(analysis) {
  const sourceCount = document.getElementById('stat-sources');
  const clusterCount = document.getElementById('stat-clusters');
  const signalCount = document.getElementById('stat-signals');
  if (sourceCount) sourceCount.textContent = String(analysis.sources.length || 0);
  if (clusterCount) clusterCount.textContent = String(analysis.clusters.length || 0);
  if (signalCount) signalCount.textContent = String(analysis.signals.length || 0);
}

function renderNews() {
  const container = document.getElementById('news-feed');
  if (!container) return;
  if (globalHeadlines.length === 0) {
    container.innerHTML = '<div class="news-empty">No source items are available right now.</div>';
    return;
  }

  container.innerHTML = globalHeadlines.map(item => `
    <article class="news-card evidence-stamp">
      <div class="news-meta">
        <span class="news-source">${escapeHtml(item.source || 'Source')}</span>
        <span class="news-date">${escapeHtml(stampFor(item))}</span>
      </div>
      <h3><a href="${item.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || 'Untitled')}</a></h3>
    </article>
  `).join('');
}

function renderStoryClusters(analysis) {
  const container = document.getElementById('story-clusters');
  if (!container) return;
  container.innerHTML = analysis.clusters.map(cluster => `
    <article class="analysis-card">
      <div class="analysis-kicker">${escapeHtml(cluster.angle)}</div>
      <h3>${escapeHtml(cluster.topic)}</h3>
      <p>${escapeHtml(cluster.summary)}</p>
      <ul class="cluster-links">
        ${cluster.items.map(item => `<li><a href="${item.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source)} — ${escapeHtml(item.title)}</a></li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function renderFramingSignals(analysis) {
  const container = document.getElementById('framing-signals');
  if (!container) return;
  if (!analysis.signals.length) {
    container.innerHTML = '<div class="signal-card">No major framing divergence detected in the current headline set.</div>';
    return;
  }
  container.innerHTML = analysis.signals.map(signal => `
    <div class="signal-card">
      <div class="signal-label">${escapeHtml(signal.label)}</div>
      <p>${escapeHtml(signal.note)}</p>
    </div>
  `).join('');
}

function renderSourceMatrix(analysis) {
  const container = document.getElementById('source-matrix');
  if (!container) return;
  container.innerHTML = analysis.sources.map(source => `
    <div class="source-pill"><strong>${escapeHtml(source.name)}</strong><span>${source.count} items</span></div>
  `).join('');
}

function buildFallbackBrief(analysis) {
  const lead = analysis.clusters[0]?.topic || 'Institutional Accountability';
  const second = analysis.clusters[1]?.topic || 'Public-cost consequences';
  const signal = analysis.signals[0]?.label || 'Narrative contrast';
  return `
    <h3>Desk Readout</h3>
    <p><strong>Macro theme:</strong> Current coverage is concentrating around ${escapeHtml(lead.toLowerCase())}, with multiple outlets reinforcing a similar public storyline.</p>
    <p><strong>Accountability watch:</strong> The strongest signal is ${escapeHtml(signal.toLowerCase())}; compare which outlets soften responsibility and which ones name it directly.</p>
    <p><strong>Forward impact:</strong> The next likely expansion area is ${escapeHtml(second.toLowerCase())}, especially where cost, legitimacy, and institutional trust overlap.</p>
  `;
}

async function loadCachedNews() {
  try {
    const res = await fetch('data/news/headlines.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data.headlines) && data.headlines.length) {
      globalHeadlines = data.headlines;
      globalAnalysis = buildAnalysis(globalHeadlines);
      updateStats(globalAnalysis);
      renderStoryClusters(globalAnalysis);
      renderFramingSignals(globalAnalysis);
      renderSourceMatrix(globalAnalysis);
      renderNews();
      return true;
    }
  } catch (err) {
    console.warn('Cached headlines unavailable:', err);
  }
  return false;
}

async function loadCachedBrief() {
  const contentDiv = document.getElementById('ai-brief-content');
  const statusBadge = document.getElementById('brief-status');
  if (!contentDiv || !statusBadge) return false;

  try {
    const res = await fetch('data/news/brief.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.brief && !/unavailable/i.test(data.brief)) {
      if (window.marked) {
        contentDiv.innerHTML = window.marked.parse(data.brief);
      } else {
        contentDiv.innerHTML = `<pre style="white-space:pre-wrap; font-family:inherit;">${escapeHtml(data.brief)}</pre>`;
      }
      statusBadge.textContent = 'AUTO BRIEF READY';
      return true;
    }
  } catch (err) {
    console.warn('Cached brief unavailable:', err);
  }

  if (globalAnalysis) {
    contentDiv.innerHTML = buildFallbackBrief(globalAnalysis);
    statusBadge.textContent = 'LOCAL ANALYSIS';
    return true;
  }
  return false;
}

async function fetchNews() {
  const container = document.getElementById('news-feed');
  if (container) {
    container.innerHTML = '<div class="news-empty">Scanning source networks…</div>';
  }

  let allItems = [];
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const data = await res.json();
      if (data.status === 'ok') {
        const items = data.items.slice(0, 8).map(item => ({
          title: item.title,
          link: item.link,
          date: item.pubDate,
          when: Math.floor(new Date(item.pubDate).getTime() / 1000),
          source: feed.name
        }));
        allItems = allItems.concat(items);
      }
    } catch (err) {
      console.error(`Failed to fetch ${feed.name}:`, err);
    }
  }

  allItems.sort((a, b) => (b.when || 0) - (a.when || 0));
  globalHeadlines = allItems.slice(0, 20);
  globalAnalysis = buildAnalysis(globalHeadlines);
  updateStats(globalAnalysis);
  renderStoryClusters(globalAnalysis);
  renderFramingSignals(globalAnalysis);
  renderSourceMatrix(globalAnalysis);
  renderNews();
  await loadCachedBrief();
}

async function generateAI_Brief() {
  const contentDiv = document.getElementById('ai-brief-content');
  const statusBadge = document.getElementById('brief-status');
  const btn = document.getElementById('btn-generate-brief');
  if (!contentDiv || !statusBadge || !btn) return;

  if (!window._t5firebaseVertexAI) {
    contentDiv.innerHTML = globalAnalysis ? buildFallbackBrief(globalAnalysis) : '<p>Local analysis will appear when source data loads.</p>';
    statusBadge.textContent = 'LOCAL ANALYSIS';
    return;
  }

  if (globalHeadlines.length === 0) return;

  btn.disabled = true;
  btn.innerHTML = 'Analyzing…';
  statusBadge.textContent = 'ANALYZING';

  const headlinesText = globalHeadlines.map(h => `- [${h.source}] ${h.title}`).join('\n');
  const prompt = `Analyze these Canadian headlines as a concise editorial intelligence brief. Use sections for macro themes, accountability watch, and forward impact. Do not invent facts.\n\n${headlinesText}`;

  try {
    const model = window._t5firebaseVertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    contentDiv.innerHTML = window.marked ? window.marked.parse(text) : `<pre style="white-space:pre-wrap; font-family:inherit;">${escapeHtml(text)}</pre>`;
    statusBadge.textContent = 'ANALYSIS COMPLETE';
  } catch (err) {
    contentDiv.innerHTML = globalAnalysis ? buildFallbackBrief(globalAnalysis) : `<div>Brief generation failed: ${escapeHtml(err.message)}</div>`;
    statusBadge.textContent = 'LOCAL ANALYSIS';
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Refresh Brief';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const btn = document.getElementById('btn-generate-brief');
  if (btn) btn.addEventListener('click', generateAI_Brief);

  const cached = await loadCachedNews();
  await loadCachedBrief();
  if (!cached) await fetchNews();
});
