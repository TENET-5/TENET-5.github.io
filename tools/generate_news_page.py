#!/usr/bin/env python3
"""
Generate news.html from data/news_feed.json
TENET5 — Powered by LIRIL AI | SEED 118400
"""

import json
from datetime import datetime, timezone
from pathlib import Path

SITE_ROOT = Path(__file__).parent.parent
FEED_FILE = SITE_ROOT / "data" / "news_feed.json"
OUTPUT = SITE_ROOT / "news.html"


def generate():
    articles = []
    if FEED_FILE.exists():
        with open(FEED_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            articles = data.get("articles", [])[:50]  # Show latest 50

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    cards_html = ""

    if not articles:
        cards_html = """
    <div class="news-empty">
      <p>News scanner initializing. First scan results will appear here shortly.</p>
      <p style="font-size:0.8rem;color:var(--text-tertiary);">Run: <code>python tools/nemoclaw_news_scanner.py</code></p>
    </div>"""
    else:
        for a in articles:
            keywords = ", ".join(a.get("matched_keywords", [])[:5])
            score = a.get("relevance_score", 0)
            score_color = "#dc2626" if score >= 15 else "#f59e0b" if score >= 10 else "#6b7280"
            cards_html += f"""
    <article class="news-card evidence-stamp">
      <div class="news-meta">
        <span class="news-source">{a.get('source', 'Unknown')}</span>
        <span class="news-score" style="color:{score_color};">RELEVANCE {score}</span>
        <span class="news-date">{a.get('pub_date', '')[:16]}</span>
      </div>
      <h3><a href="{a.get('link', '#')}" target="_blank" rel="noopener">{a.get('title', 'Untitled')}</a></h3>
      <p>{a.get('description', '')[:200]}</p>
      <div class="news-keywords">{keywords}</div>
    </article>"""

    html = f"""<!DOCTYPE html>
<html lang="en-CA">
<head>
    <!-- TENET5 SC_FRAME BUSTER -->
    <script>
      if (window === window.top && window.location.pathname.indexOf('index.html') === -1) {{
          window.location.replace('index.html?load=' + window.location.pathname.split('/').pop());
      }}
    </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News — OSINT Intelligence Feed | TENET5</title>
  <meta name="description" content="Real-time OSINT intelligence feed monitoring Canadian politics, MAID legislation, procurement, and government accountability.">
  <meta property="og:title" content="News — OSINT Intelligence Feed | TENET5">
  <meta property="og:description" content="Real-time intelligence feed from TENET5 OSINT pipeline.">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TENET5">
  <link rel="canonical" href="https://tenet5.github.io/news.html">
  <link rel="stylesheet" href="style.css?v=22">
  <link rel="stylesheet" href="css/inline_generated.css">
  <style>
    .news-hero {{
      max-width: 960px; margin: 0 auto; padding: 3rem 2rem 1.5rem;
      text-align: center; position: relative;
    }}
    .news-hero h1 {{
      font-family: var(--font-typewriter, 'Special Elite', monospace);
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      color: var(--text-primary);
      letter-spacing: 2px;
    }}
    .news-hero .subtitle {{
      font-family: var(--font-archival, 'Courier Prime', monospace);
      color: var(--text-tertiary);
      font-size: 0.85rem;
      margin-top: 0.5rem;
      letter-spacing: 1px;
    }}
    .news-hero .live-dot {{
      display: inline-block; width: 8px; height: 8px;
      background: #dc2626; border-radius: 50%;
      animation: livePulse 2s ease-in-out infinite;
      margin-right: 6px; vertical-align: middle;
    }}
    @keyframes livePulse {{
      0%, 100% {{ opacity: 1; box-shadow: 0 0 4px rgba(220,38,38,0.6); }}
      50% {{ opacity: 0.4; box-shadow: none; }}
    }}

    .news-grid {{
      max-width: 960px; margin: 0 auto; padding: 0 2rem 3rem;
      display: flex; flex-direction: column; gap: 1rem;
    }}
    .news-card {{
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-left: 3px solid rgba(196, 30, 58, 0.5);
      border-radius: 8px;
      padding: 1.2rem 1.5rem;
      position: relative;
    }}
    .news-card h3 {{
      font-size: 1rem; font-weight: 700;
      color: var(--text-primary);
      margin: 0.4rem 0 0.3rem;
    }}
    .news-card h3 a {{
      color: var(--text-primary);
      text-decoration: none;
    }}
    .news-card h3 a:hover {{
      color: var(--accent-bright);
      text-decoration: underline;
    }}
    .news-card p {{
      font-size: 0.85rem; color: var(--text-secondary);
      line-height: 1.6; margin: 0;
    }}
    .news-meta {{
      display: flex; gap: 1rem; align-items: center;
      font-size: 0.7rem; text-transform: uppercase;
      letter-spacing: 1px; color: var(--text-tertiary);
    }}
    .news-source {{
      background: rgba(196, 30, 58, 0.1);
      color: var(--accent);
      padding: 1px 6px; border-radius: 3px;
      font-weight: 700;
    }}
    .news-score {{
      font-family: var(--font-mono);
      font-weight: 700;
    }}
    .news-keywords {{
      font-size: 0.7rem; color: var(--text-tertiary);
      margin-top: 0.5rem; font-style: italic;
    }}
    .news-empty {{
      text-align: center; padding: 3rem;
      color: var(--text-tertiary);
      font-family: var(--font-archival, monospace);
    }}
    .news-footer {{
      max-width: 960px; margin: 0 auto; padding: 1rem 2rem 3rem;
      text-align: center; font-size: 0.75rem;
      color: var(--text-tertiary);
      font-family: var(--font-archival, monospace);
    }}
  </style>
</head>
<body>
  <div id="site-header-frame"></div>
  <a href="#main" class="skip-link">Skip to main content</a>

  <main id="main" role="main">
    <section class="news-hero" data-narrate="TENET5 OSINT Intelligence Feed. This page is automatically updated by the NemoClaw news scanner daemon. It monitors Canadian political RSS feeds for stories related to MAID, Brookfield, procurement waste, foreign interference, and government accountability. Every article is scored for relevance to TENET5 investigations. The scanner runs every two hours, twenty-four seven.">
      <div class="film-countdown" aria-hidden="true">7</div>
      <h1><span class="live-dot"></span>OSINT INTELLIGENCE FEED</h1>
      <p class="subtitle">NemoClaw Scanner &bull; Last updated: {now}</p>
    </section>

    <div class="news-grid">
{cards_html}
    </div>

    <div class="news-footer">
      <p>Automatically generated by NemoClaw OSINT Pipeline</p>
      <p>Sources: CBC, CTV, Globe and Mail, National Post, Parliament of Canada</p>
      <p>Scan interval: 2 hours &bull; Minimum relevance: {8} &bull; SEED 118400</p>
    </div>
  </main>

  <div style="max-width:900px;margin:2rem auto;">
    <h2 style="color:var(--accent);font-family:monospace;font-size:1.2rem;">[CONNECTED INTELLIGENCE]</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1rem;">
      <a href="follow-the-money.html" style="background:var(--glass-bg,rgba(255,255,255,0.03));border:1px solid rgba(220,38,38,0.4);padding:1rem;border-radius:6px;text-decoration:none;color:#fff;display:block;">
        <div style="font-size:0.7rem;color:#dc2626;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Financial</div>
        <div style="font-weight:700;margin-top:0.2rem;">Follow the Money</div>
      </a>
      <a href="maid-accountability.html" style="background:var(--glass-bg,rgba(255,255,255,0.03));border:1px solid rgba(220,38,38,0.4);padding:1rem;border-radius:6px;text-decoration:none;color:#fff;display:block;">
        <div style="font-size:0.7rem;color:#dc2626;text-transform:uppercase;letter-spacing:1px;font-weight:600;">MAID</div>
        <div style="font-weight:700;margin-top:0.2rem;">MAID Investigation</div>
      </a>
      <a href="carney-conflicts.html" style="background:var(--glass-bg,rgba(255,255,255,0.03));border:1px solid var(--gold,#facc15);padding:1rem;border-radius:6px;text-decoration:none;color:#fff;display:block;">
        <div style="font-size:0.7rem;color:var(--gold,#facc15);text-transform:uppercase;letter-spacing:1px;font-weight:600;">Carney</div>
        <div style="font-weight:700;margin-top:0.2rem;">Carney-Brookfield</div>
      </a>
      <a href="system-architecture.html" style="background:var(--glass-bg,rgba(255,255,255,0.03));border:1px solid #333;padding:1rem;border-radius:6px;text-decoration:none;color:#fff;display:block;">
        <div style="font-size:0.7rem;color:var(--accent);text-transform:uppercase;letter-spacing:1px;font-weight:600;">Architecture</div>
        <div style="font-weight:700;margin-top:0.2rem;">System Map</div>
      </a>
    </div>
  </div>

  <div id="site-footer-frame"></div>
</body>
</html>
"""

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"[NEWS] Generated news.html with {len(articles)} articles")


if __name__ == "__main__":
    generate()
