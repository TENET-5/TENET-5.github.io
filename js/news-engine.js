/**
 * Autonomous News Intelligence Engine
 * Fetches Canadian news RSS via rss2json and uses Vertex AI to generate an intel brief.
 */

const RSS_FEEDS = [
  { name: 'CBC Politics', url: 'https://www.cbc.ca/cmlink/rss-politics' },
  { name: 'CBC Canada', url: 'https://www.cbc.ca/cmlink/rss-canada' },
  { name: 'Global News CA', url: 'https://globalnews.ca/canada/feed/' }
];

let globalHeadlines = [];

function renderNews() {
  const container = document.getElementById('news-feed');
  if (globalHeadlines.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 2rem; color: #c41e3a;">Failed to retrieve news items.</div>';
    return;
  }
  
  let html = '';
  globalHeadlines.forEach(item => {
    const stamp = item.when
      ? new Date(item.when * 1000).toLocaleString()
      : (item.date ? new Date(item.date).toLocaleString() : 'Recent');
    html += `
      <div class="news-item">
        <div class="news-item-source">${item.source}</div>
        <h3 class="news-item-title"><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
        <div class="news-item-date">${stamp}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

async function loadCachedNews() {
  try {
    const res = await fetch('data/news/headlines.json', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data.headlines) && data.headlines.length) {
      globalHeadlines = data.headlines;
      renderNews();
      return true;
    }
  } catch (err) {
    console.warn('Cached NemoClaw headlines unavailable:', err);
  }
  return false;
}

async function loadCachedBrief() {
  const contentDiv = document.getElementById('ai-brief-content');
  const statusBadge = document.getElementById('brief-status');

  try {
    const res = await fetch('data/news/brief.json', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const data = await res.json();
    if (data.brief) {
      if (window.marked) {
        contentDiv.innerHTML = window.marked.parse(data.brief);
      } else {
        contentDiv.innerHTML = `<pre style="white-space:pre-wrap; font-family:inherit;">${data.brief}</pre>`;
      }
      statusBadge.className = 'status-badge status-live';
      statusBadge.textContent = 'AUTO BRIEF READY';
      return true;
    }
  } catch (err) {
    console.warn('Cached NemoClaw brief unavailable:', err);
  }
  return false;
}

async function fetchNews() {
  const container = document.getElementById('news-feed');
  container.innerHTML = '<div style="text-align:center; padding: 2rem; color: #9ca3af;">Scanning networks...</div>';
  
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
  renderNews();
}

async function generateAI_Brief() {
  const contentDiv = document.getElementById('ai-brief-content');
  const statusBadge = document.getElementById('brief-status');
  const btn = document.getElementById('btn-generate-brief');

  if (!window._t5firebaseVertexAI) {
    alert("Firebase Vertex AI is not initialized. Are you signed in with Google?");
    return;
  }

  if (globalHeadlines.length === 0) {
    alert("No headlines to analyze.");
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = 'Analyzing...';
  statusBadge.className = 'status-badge status-analyzing';
  statusBadge.textContent = 'ANALYZING';
  statusBadge.style.color = '#f5a623';
  statusBadge.style.background = 'rgba(245, 166, 35, 0.1)';
  statusBadge.style.borderColor = 'rgba(245, 166, 35, 0.2)';

  let headlinesText = globalHeadlines.map(h => `- [${h.source}] ${h.title}`).join('\\n');
  
  const prompt = `You are the CAP autonomous intelligence engine. Analyze the following current Canadian headlines and write a structured "Intelligence Brief". Focus on major shifts, accountability issues, human rights, and governance anomalies.
  
Headlines:
${headlinesText}

Format the response using Markdown. Include exactly these sections:
### 1. MACRO THEMES
(Identify 2-3 major overlapping themes in the news today)
### 2. ACCOUNTABILITY WATCH
(Identify any accountability issues, policy changes, or political controversies)
### 3. FORWARD IMPACT
(What these events mean for the Canadian public in the short term)
  
Do not hallucinate. Only use the provided headlines. Make it professional and analytical.`;

  try {
    const model = window._t5firebaseVertexAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Convert Markdown to HTML
    if (window.marked) {
      contentDiv.innerHTML = window.marked.parse(text);
    } else {
      contentDiv.innerHTML = `<pre style="white-space:pre-wrap; font-family:inherit;">${text}</pre>`;
    }
    
    statusBadge.className = 'status-badge status-live';
    statusBadge.textContent = 'ANALYSIS COMPLETE';
    statusBadge.style.color = '#00ff80';
    statusBadge.style.background = 'rgba(0, 255, 128, 0.1)';
    statusBadge.style.borderColor = 'rgba(0, 255, 128, 0.2)';
    
  } catch (err) {
    console.error("AI Brief generation failed", err);
    contentDiv.innerHTML = `<div style="color:#c41e3a; text-align:center;">Brief generation failed: ${err.message}. Ensure you are signed in and Firebase Auth is configured.</div>`;
    statusBadge.textContent = 'ERROR';
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Regenerate Brief';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const btn = document.getElementById('btn-generate-brief');
  if (btn) {
    btn.addEventListener('click', generateAI_Brief);
  }

  const cached = await loadCachedNews();
  await loadCachedBrief();
  if (!cached) {
    await fetchNews();
  }
});
